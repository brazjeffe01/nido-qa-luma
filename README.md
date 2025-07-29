# QA Luma Store (NIDA Tecnologia)

Projeto desenvolvido como parte do processo seletivo para a vaga de Analista de QA na NIDA Tecnologia, utilizando o site https://magento.softwaretestingboard.com/.

Nesse projeto focado em testes de sistema, foram criados tantos testes de ponta-a-ponta (E2E), quanto testes em funcionalidades mais específicas, utilizando o Cypress como framework de testes automatizados.

## Por que escolhi o Cypress para o projeto

Escolhi utilizar o Cypress para o projeto pois é a ferramenta que possuo um conhecimento mais profundo no momento, e também por considerar ser uma ferramenta muito robusta e que atende muito bem quando o foco é em testes E2E onde se é necessário lidar com requisições HTTP.

Acredito que os pontos positivos do framework seriam sua sintaxe bem intuitiva, tecnologias embutidas junto com framework (Ex: Chai, JQuery, Lodash e etc.), e a documentação que é bem ampla também, ajudando muito no caso de dúvidas.

## Informações sobre o projeto

- Após clonar o projeto na máquina, é necessário executar o comando `npm install` no terminal para instalar todas as dependências do projeto.

- Para executar os testes com relatório automático, necessário executar o comando `npm run cy:run-reports` no terminal.

- Após execução dos testes, relatório no formato .html estará disponível na pasta *mochawesome-report*.
