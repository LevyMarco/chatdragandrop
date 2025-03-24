import React, { useState, useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  Handle,
  useNodesState,
  useEdgesState,
  addEdge
} from 'react-flow-renderer';

// =============== ESTILOS ===============
const sidebarStyles = {
  width: '260px',
  backgroundColor: '#fff',
  borderRadius: '8px',
  padding: '20px',
  margin: '10px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

const flowContainerStyles = {
  flex: 1,
  height: '100%',
  position: 'relative',
  overflow: 'hidden'
};

const nodeStyles = {
  base: {
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '2px solid #2684ff',
    minWidth: '300px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  input: {
    margin: '10px 0',
    padding: '8px',
    width: '100%',
    borderRadius: '4px',
    border: '1px solid #ddd'
  },
  section: {
    margin: '15px 0',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    width: '100%'
  },
  select: {
    width: '100%',
    padding: '8px',
    margin: '5px 0'
  },
  deleteButton: {
    background: 'red',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '10px'
  }
};

const handleStyle = {
  width: '15px',
  height: '15px',
  backgroundColor: '#2684ff',
  border: '2px solid #fff',
  borderRadius: '50%'
};

const chipStyle = {
  margin: '5px',
  padding: '6px 12px',
  border: '1px solid #ddd',
  borderRadius: '20px',
  background: '#f8f9fa',
  cursor: 'pointer',
  fontSize: '14px'
};

// =============== COMPONENTES DE NÓS ===============

const MessageNode = React.memo(({ id, data }) => (
  <div style={nodeStyles.base}>
    <Handle type="target" position="left" style={handleStyle} />
    <h4>💬 Mensagem</h4>
    <textarea
      style={{ ...nodeStyles.input, height: '100px' }}
      value={data.content}
      onChange={(e) => data.updateContent(e.target.value)}
      placeholder="Escreva sua mensagem..."
    />
    <button style={nodeStyles.deleteButton} onClick={() => data.onDelete(id)}>
      🗑️
    </button>
    <Handle type="source" position="right" style={handleStyle} />
  </div>
));

const QuestionNode = React.memo(({ id, data }) => {
  const handleOptionChange = (index, value) => {
    const newOptions = [...data.options];
    newOptions[index] = value;
    data.updateOptions(newOptions);
  };

  return (
    <div style={nodeStyles.base}>
      <Handle type="target" position="left" style={handleStyle} />
      <h4>❓ Pergunta</h4>
      <input
        type="text"
        style={nodeStyles.input}
        value={data.question}
        onChange={(e) => data.updateQuestion(e.target.value)}
        placeholder="Digite a pergunta"
      />
      <div style={nodeStyles.section}>
        <h5>Opções de Resposta:</h5>
        {data.options.map((opt, index) => (
          <div key={index} style={{ margin: '5px 0', position: 'relative' }}>
            <input
              type="text"
              value={opt}
              style={{ ...nodeStyles.input, width: '80%' }}
              onChange={(e) => handleOptionChange(index, e.target.value)}
            />
            <Handle
              type="source"
              position="right"
              id={`option-${index}`}
              style={{
                ...handleStyle,
                right: '-8px',
                top: '50%',
                transform: 'translateY(-50%)'
              }}
            />
          </div>
        ))}
        <button onClick={data.addOption}>+ Adicionar Opção</button>
      </div>
      <button style={nodeStyles.deleteButton} onClick={() => data.onDelete(id)}>
        🗑️
      </button>
    </div>
  );
});

const MediaNode = React.memo(({ id, data }) => (
  <div style={nodeStyles.base}>
    <Handle type="target" position="left" style={handleStyle} />
    <h4>🖼️ Mídia</h4>
    <input
      type="file"
      onChange={(e) => data.handleFileUpload(e.target.files[0])}
      style={nodeStyles.input}
    />
    <div style={nodeStyles.section}>
      <h5>Ou insira URL:</h5>
      <input
        type="text"
        value={data.url}
        onChange={(e) => data.updateUrl(e.target.value)}
        placeholder="https://exemplo.com/imagem.jpg"
        style={nodeStyles.input}
      />
    </div>
    <button style={nodeStyles.deleteButton} onClick={() => data.onDelete(id)}>
      🗑️
    </button>
    <Handle type="source" position="right" style={handleStyle} />
  </div>
));

const ConditionNode = React.memo(({ id, data }) => (
  <div style={nodeStyles.base}>
    <Handle type="target" position="left" style={handleStyle} />
    <h4>⚖️ Condição</h4>
    <select
      value={data.conditionType}
      onChange={(e) => data.updateConditionType(e.target.value)}
      style={nodeStyles.select}
    >
      <option value="cadastro">Verificar Cadastro</option>
      <option value="valor">Comparar Valores</option>
    </select>

    {data.conditionType === 'cadastro' && (
      <div style={nodeStyles.section}>
        <input
          type="text"
          value={data.field}
          onChange={(e) => data.updateField(e.target.value)}
          placeholder="Campo para verificação (ex: PHONE)"
          style={nodeStyles.input}
        />
      </div>
    )}

    {data.conditionType === 'valor' && (
      <div style={nodeStyles.section}>
        <input
          type="text"
          value={data.comparison}
          onChange={(e) => data.updateComparison(e.target.value)}
          placeholder="Expressão (ex: VALUE > 100)"
          style={nodeStyles.input}
        />
      </div>
    )}

    <button style={nodeStyles.deleteButton} onClick={() => data.onDelete(id)}>
      🗑️
    </button>
    <Handle
      type="source"
      position="right"
      id="true"
      style={{ ...handleStyle, top: '30%' }}
    />
    <Handle
      type="source"
      position="right"
      id="false"
      style={{ ...handleStyle, top: '70%' }}
    />
  </div>
));

const IntervalNode = React.memo(({ id, data }) => (
  <div style={nodeStyles.base}>
    <Handle type="target" position="left" style={handleStyle} />
    <h4>⏱️ Intervalo</h4>
    <div style={nodeStyles.section}>
      <input
        type="number"
        value={data.duration}
        onChange={(e) => data.updateDuration(e.target.value)}
        placeholder="Duração em segundos"
        min="1"
        max="7200"
        style={nodeStyles.input}
      />
      <small>Máximo: 2 horas (7200 segundos)</small>
    </div>
    <button style={nodeStyles.deleteButton} onClick={() => data.onDelete(id)}>
      🗑️
    </button>
    <Handle type="source" position="right" style={handleStyle} />
  </div>
));

const ChatGPTNode = React.memo(({ id, data }) => (
  <div style={nodeStyles.base}>
    <Handle type="target" position="left" style={handleStyle} />
    <h4>🤖 Chat GPT</h4>
    <input
      type="password"
      value={data.apiKey}
      onChange={(e) => data.updateApiKey(e.target.value)}
      placeholder="Insira sua API Key da OpenAI"
      style={nodeStyles.input}
    />
    <textarea
      value={data.instructions}
      onChange={(e) => data.updateInstructions(e.target.value)}
      placeholder="Instruções para o assistente..."
      style={{ ...nodeStyles.input, height: '100px' }}
    />
    <button style={nodeStyles.deleteButton} onClick={() => data.onDelete(id)}>
      🗑️
    </button>
    <Handle type="source" position="right" style={handleStyle} />
  </div>
));

const APINode = React.memo(({ id, data }) => (
  <div style={nodeStyles.base}>
    <Handle type="target" position="left" style={handleStyle} />
    <h4>🌐 API Externa</h4>
    <div style={nodeStyles.section}>
      <select
        value={data.method}
        onChange={(e) => data.updateMethod(e.target.value)}
        style={nodeStyles.select}
      >
        <option value="GET">GET</option>
        <option value="POST">POST</option>
        <option value="PUT">PUT</option>
        <option value="DELETE">DELETE</option>
      </select>
      <input
        type="text"
        value={data.url}
        onChange={(e) => data.updateUrl(e.target.value)}
        placeholder="URL da API"
        style={nodeStyles.input}
      />
    </div>

    <div style={nodeStyles.section}>
      <h5>Cabeçalhos:</h5>
      <textarea
        value={data.headers}
        onChange={(e) => data.updateHeaders(e.target.value)}
        placeholder="JSON de cabeçalhos"
        style={{ ...nodeStyles.input, height: '80px' }}
      />
    </div>

    <div style={nodeStyles.section}>
      <h5>Corpo da Requisição:</h5>
      <textarea
        value={data.body}
        onChange={(e) => data.updateBody(e.target.value)}
        placeholder="JSON do corpo"
        style={{ ...nodeStyles.input, height: '100px' }}
      />
    </div>
    <button style={nodeStyles.deleteButton} onClick={() => data.onDelete(id)}>
      🗑️
    </button>
    <Handle type="source" position="right" style={handleStyle} />
  </div>
));

const UpdateCRMNode = React.memo(({ id, data }) => (
  <div style={nodeStyles.base}>
    <Handle type="target" position="left" style={handleStyle} />
    <h4>🔄 Atualizar CRM</h4>
    <div style={nodeStyles.section}>
      <select
        value={data.entity}
        onChange={(e) => data.updateEntity(e.target.value)}
        style={nodeStyles.select}
      >
        <option value="lead">Lead</option>
        <option value="deal">Negócio</option>
        <option value="contact">Contato</option>
        <option value="company">Empresa</option>
      </select>

      <input
        type="text"
        value={data.field}
        onChange={(e) => data.updateField(e.target.value)}
        placeholder="Campo para atualizar"
        style={nodeStyles.input}
      />

      <input
        type="text"
        value={data.value}
        onChange={(e) => data.updateValue(e.target.value)}
        placeholder="Novo valor"
        style={nodeStyles.input}
      />
    </div>
    <button style={nodeStyles.deleteButton} onClick={() => data.onDelete(id)}>
      🗑️
    </button>
    <Handle type="source" position="right" style={handleStyle} />
  </div>
));

const CreateRecordNode = React.memo(({ id, data }) => (
  <div style={nodeStyles.base}>
    <Handle type="target" position="left" style={handleStyle} />
    <h4>📝 Criar Cadastro</h4>
    <div style={nodeStyles.section}>
      <select
        value={data.entity}
        onChange={(e) => data.updateEntity(e.target.value)}
        style={nodeStyles.select}
      >
        <option value="lead">Lead</option>
        <option value="deal">Negócio</option>
        <option value="contact">Contato</option>
        <option value="company">Empresa</option>
      </select>

      <select
        value={data.stage}
        onChange={(e) => data.updateStage(e.target.value)}
        style={nodeStyles.select}
      >
        <option value="new">Novo</option>
        <option value="qualified">Qualificado</option>
        <option value="proposal">Proposta</option>
        <option value="closed">Fechado</option>
      </select>

      <textarea
        value={data.fields}
        onChange={(e) => data.updateFields(e.target.value)}
        placeholder="Campos (JSON)"
        style={{ ...nodeStyles.input, height: '150px' }}
      />
    </div>
    <button style={nodeStyles.deleteButton} onClick={() => data.onDelete(id)}>
      🗑️
    </button>
    <Handle type="source" position="right" style={handleStyle} />
  </div>
));

const TransferNode = React.memo(({ id, data }) => (
  <div style={nodeStyles.base}>
    <Handle type="target" position="left" style={handleStyle} />
    <h4>🔀 Transferir</h4>
    <p style={{ textAlign: 'center' }}>Exemplo de nó de transferência</p>
    <button style={nodeStyles.deleteButton} onClick={() => data.onDelete(id)}>
      🗑️
    </button>
    <Handle type="source" position="right" style={handleStyle} />
  </div>
));

const ScheduleNode = React.memo(({ id, data }) => (
  <div style={nodeStyles.base}>
    <Handle type="target" position="left" style={handleStyle} />
    <h4>⏰ Horário</h4>
    <p style={{ textAlign: 'center' }}>Exemplo de nó de agendamento</p>
    <button style={nodeStyles.deleteButton} onClick={() => data.onDelete(id)}>
      🗑️
    </button>
    <Handle type="source" position="right" style={handleStyle} />
  </div>
));

const EndNode = React.memo(({ id, data }) => (
  <div style={nodeStyles.base}>
    <Handle type="target" position="left" style={handleStyle} />
    <h4>🏁 Finalizar</h4>
    <p style={{ textAlign: 'center' }}>Exemplo de nó de finalização</p>
    <button style={nodeStyles.deleteButton} onClick={() => data.onDelete(id)}>
      🗑️
    </button>
    <Handle type="source" position="right" style={handleStyle} />
  </div>
));

const nodeTypes = {
  message: MessageNode,
  question: QuestionNode,
  media: MediaNode,
  condition: ConditionNode,
  interval: IntervalNode,
  chatgpt: ChatGPTNode,
  api: APINode,
  updateCRM: UpdateCRMNode,
  createRecord: CreateRecordNode,
  transfer: TransferNode,
  schedule: ScheduleNode,
  end: EndNode
};

export default function FlowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [idCounter, setIdCounter] = useState(0);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const isValidConnection = useCallback(
    (connection) => {
      const sourceNode = nodes.find((node) => node.id === connection.source);
      if (sourceNode?.type === 'question' || sourceNode?.type === 'condition') {
        return true;
      }
      const hasExistingConnection = edges.some(
        (edge) => edge.source === connection.source
      );
      return !hasExistingConnection;
    },
    [nodes, edges]
  );

  const deleteNode = useCallback(
    (nodeId) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );
    },
    [setNodes, setEdges]
  );

  const updateNode = useCallback(
    (nodeId, newData) => {
      setNodes((prevNodes) =>
        prevNodes.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...newData } }
            : node
        )
      );
    },
    [setNodes]
  );

  const createNode = useCallback(
    (type, initialData) => {
      const nodeId = `${type}-${idCounter}`;
      setIdCounter((prev) => prev + 1);

      const updateFunctions = {
        message: {
          updateContent: (content) => updateNode(nodeId, { content }),
          onDelete: deleteNode
        },
        question: {
          updateQuestion: (question) => updateNode(nodeId, { question }),
          addOption: () => {
            setNodes((prevNodes) =>
              prevNodes.map((node) =>
                node.id === nodeId
                  ? {
                      ...node,
                      data: {
                        ...node.data,
                        options: [
                          ...(node.data.options || []),
                          `Opção ${
                            node.data.options ? node.data.options.length + 1 : 1
                          }`
                        ]
                      }
                    }
                  : node
              )
            );
          },
          updateOptions: (options) => updateNode(nodeId, { options }),
          onDelete: deleteNode
        },
        media: {
          handleFileUpload: (file) => updateNode(nodeId, { file }),
          updateUrl: (url) => updateNode(nodeId, { url }),
          onDelete: deleteNode
        },
        condition: {
          updateConditionType: (conditionType) =>
            updateNode(nodeId, { conditionType }),
          updateField: (field) => updateNode(nodeId, { field }),
          updateComparison: (comparison) => updateNode(nodeId, { comparison }),
          onDelete: deleteNode
        },
        interval: {
          updateDuration: (duration) => updateNode(nodeId, { duration }),
          onDelete: deleteNode
        },
        chatgpt: {
          updateApiKey: (apiKey) => updateNode(nodeId, { apiKey }),
          updateInstructions: (instructions) =>
            updateNode(nodeId, { instructions }),
          onDelete: deleteNode
        },
        api: {
          updateMethod: (method) => updateNode(nodeId, { method }),
          updateUrl: (url) => updateNode(nodeId, { url }),
          updateHeaders: (headers) => updateNode(nodeId, { headers }),
          updateBody: (body) => updateNode(nodeId, { body }),
          onDelete: deleteNode
        },
        updateCRM: {
          updateEntity: (entity) => updateNode(nodeId, { entity }),
          updateField: (field) => updateNode(nodeId, { field }),
          updateValue: (value) => updateNode(nodeId, { value }),
          onDelete: deleteNode
        },
        createRecord: {
          updateEntity: (entity) => updateNode(nodeId, { entity }),
          updateStage: (stage) => updateNode(nodeId, { stage }),
          updateFields: (fields) => updateNode(nodeId, { fields }),
          onDelete: deleteNode
        },
        transfer: {
          onDelete: deleteNode
        },
        schedule: {
          onDelete: deleteNode
        },
        end: {
          onDelete: deleteNode
        }
      };

      const newNode = {
        id: nodeId,
        type,
        data: { ...initialData, ...updateFunctions[type] },
        position: { x: Math.random() * 400, y: Math.random() * 400 }
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [idCounter, updateNode, deleteNode, setNodes]
  );

  const categories = [
    {
      title: 'Conversa',
      items: [
        { label: 'Mensagem', nodeType: 'message', initialData: { content: '' } },
        {
          label: 'Pergunta',
          nodeType: 'question',
          initialData: { question: '', options: [] }
        },
        { label: 'Mídia', nodeType: 'media', initialData: { url: '' } }
      ]
    },
    {
      title: 'Ações do chat',
      items: [
        {
          label: 'Condição',
          nodeType: 'condition',
          initialData: {
            conditionType: 'cadastro',
            field: '',
            comparison: ''
          }
        },
        { label: 'Transferir', nodeType: 'transfer', initialData: {} },
        { label: 'Horário', nodeType: 'schedule', initialData: {} },
        { label: 'Finalizar', nodeType: 'end', initialData: {} },
        { label: 'Intervalo', nodeType: 'interval', initialData: { duration: 1 } }
      ]
    },
    {
      title: 'Integrações',
      items: [
        {
          label: 'Chat GPT',
          nodeType: 'chatgpt',
          initialData: { apiKey: '', instructions: '' }
        },
        {
          label: 'API Externa',
          nodeType: 'api',
          initialData: { method: 'GET', url: '', headers: '', body: '' }
        }
      ]
    },
    {
      title: 'Bitrix',
      items: [
        {
          label: 'Atualizar CRM',
          nodeType: 'updateCRM',
          initialData: { entity: 'lead', field: '', value: '' }
        },
        {
          label: 'Criar Cadastro',
          nodeType: 'createRecord',
          initialData: { entity: 'lead', stage: 'new', fields: '' }
        }
      ]
    }
  ];

  function CategoryBlock({ title, items }) {
    return (
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ marginBottom: '10px' }}>{title}</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {items.map((item) => (
            <button
              key={item.label}
              style={chipStyle}
              onClick={() => createNode(item.nodeType, item.initialData)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* SIDEBAR */}
      <div style={sidebarStyles}>
        <h3 style={{ marginBottom: '20px' }}>Qual a interação que deseja?</h3>

        {categories.map((cat) => (
          <CategoryBlock key={cat.title} title={cat.title} items={cat.items} />
        ))}
      </div>

      {/* ÁREA DO FLUXO */}
      <div style={flowContainerStyles}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          connectionLineStyle={{ stroke: '#ddd', strokeWidth: 2 }}
          snapToGrid={true}
          snapGrid={[15, 15]}
          isValidConnection={isValidConnection}
        >
          <MiniMap />
          <Controls />
          <Background color="#aaa" gap={16} />
        </ReactFlow>
      </div>
    </div>
  );
}