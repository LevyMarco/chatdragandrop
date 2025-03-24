import os
from flask import Flask, send_from_directory, jsonify, request
from dotenv import load_dotenv
from flask_cors import CORS

load_dotenv()

# Atualize o caminho para o build do front novo
# Supondo que o build esteja em "ProjetoDragAndDrop/dragndrop-front/build"
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'build'))

app = Flask(
    __name__,
    static_folder=BASE_DIR,  # Aponta para o build do front novo
    static_url_path=''       # A raiz para servir arquivos estáticos
)
CORS(app)

# Verifica se o diretório de build existe
if not os.path.exists(app.static_folder):
    raise RuntimeError(f"Diretório de build não encontrado: {app.static_folder}")

# Rota para a raiz, aceita GET e POST (caso o Bitrix envie POST)
@app.route('/', methods=['GET', 'POST'])
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

# Rota dedicada para arquivos estáticos (CSS, JS, imagens)
@app.route('/static/<path:filename>')
def serve_static(filename):
    static_dir = os.path.join(app.static_folder, 'static')
    return send_from_directory(static_dir, filename)

# Rota fallback para a SPA (Single Page Application)
@app.route('/<path:subpath>', methods=['GET', 'POST'])
def fallback(subpath):
    return send_from_directory(app.static_folder, 'index.html')

# Exemplo de endpoint de API para salvar fluxo
@app.route("/api/save_flow", methods=["POST"])
def api_save_flow():
    try:
        flow_data = request.get_json(silent=True) or request.form.to_dict()
        if not flow_data:
            return jsonify({"error": "Dados não recebidos"}), 400
        
        # Lógica de salvamento (ou encaminhar para o banco de dados)
        # Aqui você pode chamar sua função save_flow(flow_data)
        return jsonify({"message": "Fluxo salvo com sucesso!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Endpoint para execução do fluxo, se aplicável
@app.route("/api/execute_flow/<flow_id>", methods=["POST"])
def execute_flow_endpoint(flow_id):
    try:
        # Carrega o fluxo do banco de dados (função get_flow)
        flow = get_flow(flow_id)
        dialog_id = request.json.get('dialog_id')
        result = process_flow(flow, dialog_id)  # Função que percorre o fluxo e executa ações
        return jsonify({"status": "success", "result": result}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# Outras rotas do backend, por exemplo, webhook do Bitrix
@app.route("/api/bitrix/webhook", methods=["POST"])
def bitrix_webhook():
    try:
        data = request.get_json()
        handler = BitrixWebhookHandler(data)
        handler.process_event()
        return jsonify({"status": "received"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# Classe para tratamento de webhook do Bitrix (exemplo)
class BitrixWebhookHandler:
    def __init__(self, data):
        self.data = data
    
    def process_event(self):
        event_type = self.data.get('event')
        if event_type == 'ONIMBOTMESSAGEADD':
            self.handle_new_message()
        elif event_type == 'ONCRMLEADUPDATE':
            self.handle_lead_update()
    
    def handle_new_message(self):
        dialog_id = self.data.get('dialog_id')
        message = self.data.get('message')
        # Lógica para processar nova mensagem
        print("Nova mensagem recebida:", dialog_id, message)
    
    def handle_lead_update(self):
        # Lógica para processar atualização de lead
        print("Atualização de lead:", self.data)

# Funções auxiliares para fluxo (supondo que existam)
def process_flow(flow_data, dialog_id):
    # Implemente a lógica para percorrer e executar o fluxo
    return "Fluxo executado com sucesso!"

def get_flow(flow_id):
    # Implemente a lógica para recuperar o fluxo do banco de dados
    return {}

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    app.run(debug=True, port=port)