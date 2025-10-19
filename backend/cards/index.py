'''
Business: Cards and transactions management API
Args: event - dict with httpMethod, body containing card and transaction data
      context - object with attributes: request_id, function_name
Returns: HTTP response with card/transaction data or error
'''

import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor
import random

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def generate_card_number():
    return ' '.join([''.join([str(random.randint(0, 9)) for _ in range(4)]) for _ in range(4)])

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id'
    }
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    if method == 'GET':
        params = event.get('queryStringParameters', {}) or {}
        user_id = params.get('user_id')
        action = params.get('action')
        
        if action == 'all_cards':
            cursor.execute(
                "SELECT c.*, u.first_name, u.last_name, u.email FROM cards c JOIN users u ON c.user_id = u.id"
            )
            cards = cursor.fetchall()
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps([dict(card) for card in cards], default=str),
                'isBase64Encoded': False
            }
        
        if user_id:
            cursor.execute(
                "SELECT * FROM cards WHERE user_id = %s",
                (user_id,)
            )
            cards = cursor.fetchall()
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps([dict(card) for card in cards], default=str),
                'isBase64Encoded': False
            }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action')
        
        if action == 'create_card':
            user_id = body_data.get('user_id')
            
            cursor.execute(
                "SELECT first_name, last_name FROM users WHERE id = %s",
                (user_id,)
            )
            user = cursor.fetchone()
            
            if not user:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({'error': 'Пользователь не найден'}),
                    'isBase64Encoded': False
                }
            
            card_number = generate_card_number()
            card_holder = f"{user['first_name']} {user['last_name']}".upper()
            initial_balance = body_data.get('initial_balance', 0)
            
            cursor.execute(
                "INSERT INTO cards (user_id, card_number, card_holder, balance) VALUES (%s, %s, %s, %s) RETURNING *",
                (user_id, card_number, card_holder, initial_balance)
            )
            card = cursor.fetchone()
            conn.commit()
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(dict(card), default=str),
                'isBase64Encoded': False
            }
        
        elif action == 'link_phone':
            card_id = body_data.get('card_id')
            phone = body_data.get('phone')
            
            cursor.execute(
                "UPDATE cards SET phone = %s WHERE id = %s RETURNING *",
                (phone, card_id)
            )
            card = cursor.fetchone()
            conn.commit()
            cursor.close()
            conn.close()
            
            if not card:
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({'error': 'Карта не найдена'}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(dict(card), default=str),
                'isBase64Encoded': False
            }
        
        elif action == 'transfer':
            from_card_number = body_data.get('from_card_number')
            to_identifier = body_data.get('to_identifier')
            amount = float(body_data.get('amount', 0))
            description = body_data.get('description', '')
            
            cursor.execute("SELECT * FROM cards WHERE card_number = %s", (from_card_number,))
            from_card = cursor.fetchone()
            
            cursor.execute(
                "SELECT * FROM cards WHERE card_number = %s OR phone = %s",
                (to_identifier, to_identifier)
            )
            to_card = cursor.fetchone()
            
            if not from_card or not to_card:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({'error': 'Карта не найдена'}),
                    'isBase64Encoded': False
                }
            
            if from_card['balance'] < amount:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Недостаточно средств'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute(
                "UPDATE cards SET balance = balance - %s WHERE id = %s",
                (amount, from_card['id'])
            )
            
            cursor.execute(
                "UPDATE cards SET balance = balance + %s WHERE id = %s",
                (amount, to_card['id'])
            )
            
            cursor.execute(
                "INSERT INTO transactions (from_card_id, to_card_id, amount, description) VALUES (%s, %s, %s, %s) RETURNING *",
                (from_card['id'], to_card['id'], amount, description)
            )
            transaction = cursor.fetchone()
            conn.commit()
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(dict(transaction), default=str),
                'isBase64Encoded': False
            }
        
        elif action == 'add_balance':
            card_number = body_data.get('card_number')
            amount = float(body_data.get('amount', 0))
            
            cursor.execute(
                "UPDATE cards SET balance = balance + %s WHERE card_number = %s RETURNING *",
                (amount, card_number)
            )
            card = cursor.fetchone()
            conn.commit()
            cursor.close()
            conn.close()
            
            if not card:
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({'error': 'Карта не найдена'}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(dict(card), default=str),
                'isBase64Encoded': False
            }
    
    cursor.close()
    conn.close()
    return {
        'statusCode': 405,
        'headers': headers,
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }