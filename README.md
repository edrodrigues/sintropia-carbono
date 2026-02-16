# Sintropia Carbono

Dashboard de inteligência colaborativa sobre certificadoras, volumes e tendências do mercado de créditos de carbono e certificados I-REC no Brasil e no mundo.

## Sobre o Projeto

Sintropia Carbono é um projeto **open source** colaborativo que visa democratizar o acesso a informações sobre o mercado de carbono e certificados de energia renovável (I-REC). O projeto compila dados de fontes públicas para oferecer uma visão abrangente do mercado brasileiro e global.

## Páginas

| Página | Descrição |
|--------|-----------|
| [index.html](index.html) | Dashboard principal com visão geral do mercado |
| [certificadoras.html](certificadoras.html) | Informações sobre as principais certificadoras globais e nacionais |
| [irec-brasil.html](irec-brasil.html) | Top 25 empresas brasileiras no mercado de certificados I-REC |
| [irec-mundo.html](irec-mundo.html) | Maiores compradores de energia renovável no mundo |
| [carbono-brasil.html](carbono-brasil.html) | Ranking de empresas brasileiras por setor de atuação |
| [carbono-mundo.html](carbono-mundo.html) | Top 25 compradores globais de créditos de carbono |
| [carbono-precos.html](carbono-precos.html) | Histórico de preços de créditos de carbono (2024-2025) |
| [irec-precos.html](irec-precos.html) | Histórico de preços de certificados I-REC (2024-2025) |

## Tecnologias

- HTML5
- Tailwind CSS
- JavaScript (vanilla)
- Chart.js (para visualizações)

## Como Executar

1. Clone o repositório:
   ```bash
   git clone https://github.com/edrodrigues/sintropia-carbono.git
   ```

2. Abra o arquivo `index.html` no seu navegador, ou utilize um servidor local:
   ```bash
   npx serve .
   ```

## Como Contribuir

Este é um projeto colaborativo! Você pode contribuir de várias formas:

### 1. Reportando Bugs
Encontrou algum erro nos dados ou no layout? Abra uma issue no GitHub com:
- Descrição do problema
- Captura de tela (se aplicável)
- Passos para reproduzir

### 2. Sugerindo Funcionalidades
Tiene uma ideia para melhorar o dashboard? Abra uma issue com:
- Descrição da funcionalidade
- Por que seria útil
- Sugestão de implementação (opcional)

### 3. Atualizando Dados
Os dados estão em [dados/dados.json](dados/dados.json) e [dados/dados.md](dados/dados.md). Para atualizar:
1. Fork o repositório
2. Atualize os arquivos de dados
3. Abra um Pull Request com a fonte dos novos dados

### 4. Melhorando o Design
O projeto usa Tailwind CSS. Para contribuir com melhorias visuais:
1. Edite os arquivos HTML diretamente
2. Teste em diferentes tamanhos de tela
3. Abra um Pull Request com as mudanças

### 5. Documentando
Melhore a documentação do projeto:
- Adicione comentários no código
- Atualize este README
- Crie tutoriais

## Estrutura do Projeto

```
MercadoCarbono/
├── index.html           # Dashboard principal
├── certificadoras.html  # Certificadoras de carbono
├── irec-brasil.html     # I-REC no Brasil
├── irec-mundo.html      # I-REC no mundo
├── carbono-brasil.html  # Carbono no Brasil
├── carbono-mundo.html   # Carbono no mundo
├── carbono-precos.html  # Preços de carbono
├── irec-precos.html     # Preços de I-REC
├── dados/
│   ├── dados.json       # Dados em formato JSON
│   └── dados.md         # Dados em formato Markdown
└── js/
    └── (scripts)
```

## Dados

Os dados são consolidados de fontes públicas e atualizados periodicamente. Cada página inclui referências às fontes utilizadas. Veja o arquivo `dados/dados.md` para informações detalhadas sobre todas as fontes.

## Licença

Este projeto está sob licença MIT. Sinta-se livre para usar, modificar e distribuir.

---

**Sintropia Carbono** - Construindo um futuro mais sustentável através da transparência de dados

**Repositório GitHub:** [https://github.com/edrodrigues/sintropia-carbono](https://github.com/edrodrigues/sintropia-carbono)

**Email de contato:** ernj@cin.ufpe.br
