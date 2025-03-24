# database.py
import psycopg2
import os
import json
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    return psycopg2.connect(
        host=os.getenv("PGHOST"),
        database=os.getenv("PGDATABASE"),
        user=os.getenv("PGUSER"),
        password=os.getenv("PGPASSWORD"),
        port=os.getenv("PGPORT", "5432")
    )

def save_flow(flow_data):
    """
    Salva o fluxo (JSON de nós e arestas) no banco, retornando o ID.
    """
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT INTO flows (data) VALUES (%s) RETURNING id;",
                (json.dumps(flow_data),)
            )
            flow_id = cursor.fetchone()[0]
            conn.commit()
            return flow_id
    finally:
        conn.close()

def get_flow(flow_id):
    """
    Retorna o JSON do fluxo a partir do ID.
    """
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT data FROM flows WHERE id = %s;",
                (flow_id,)
            )
            result = cursor.fetchone()
            return result[0] if result else None
    finally:
        conn.close()