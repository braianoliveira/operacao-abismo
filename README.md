# Operação: Abismo

Um jogo de sobrevivência, tensão e exploração submarina desenvolvido em JavaScript utilizando o framework **Phaser 3**. 

Nesta experiência, você pilota um submarino gravemente avariado nas profundezas do oceano. Com a navegação permanentemente danificada e imerso na escuridão total, sua única ferramenta é um sonar que consome bateria a cada pulso. 

## 🌊 Fases do Jogo
* **Fase 1 (O Abismo):** Navegue no escuro para encontrar peças de reparo do casco. O sonar é vital para revelar itens e minas ocultas, mas usá-lo diretamente sobre uma mina causará detonação imediata. Administre sua bateria com cautela.
* **Fase 2 (A Ascensão):** Com os sistemas parcialmente reparados e a água mais clara, inicie a subida para a superfície. O desafio muda de exploração para precisão extrema ao ter que atravessar um denso campo de minas hipersensíveis à vibração da água.

## 🎮 Controles
* **Mouse (Clique Esquerdo):** Disparar pulso do Sonar (apenas na Fase 1).
* **Setas Direcionais:** Tentar manobrar o submarino.

---

## 🚀 Como Executar o Jogo Localmente

Como o jogo utiliza arquivos locais (imagens do submarino, minas, etc.), se você simplesmente der um "duplo clique" no arquivo `index.html`, o navegador provavelmente exibirá uma tela preta. Isso acontece devido a uma proteção de segurança dos navegadores modernos chamada **CORS**, que bloqueia o carregamento de mídias pelo protocolo `file:///`.

Para rodar o jogo corretamente, você precisa emular um servidor web local. Abaixo estão as formas mais fáceis de fazer isso:

### Opção 1: Usando o Visual Studio Code (Recomendado)
Se você usa o VS Code para editar seus códigos, esta é a maneira mais simples:
1. Abra o VS Code e vá na aba de Extensões (`Ctrl + Shift + X`).
2. Pesquise pela extensão **Live Server** (do autor Ritwick Dey) e instale-a.
3. Abra a pasta do jogo no VS Code.
4. Clique com o botão direito sobre o arquivo `index.html` e selecione **"Open with Live Server"**.
5. O jogo abrirá automaticamente no seu navegador padrão funcionando perfeitamente.

### Opção 2: Usando Python (Via Terminal)
Se você possui o Python instalado no seu computador:
1. Abra o terminal (Prompt de Comando ou PowerShell).
2. Navegue até a pasta onde estão os arquivos do jogo.
3. Digite o comando: `python -m http.server 8000`
4. Abra o seu navegador e acesse: `http://localhost:8000`

### Opção 3: Usando Node.js (Via Terminal)
Se você utiliza Node.js:
1. Abra o terminal na pasta do jogo.
2. Execute o comando: `npx serve` (ou instale o pacote globalmente com `npm install -g http-server` e rode `http-server`).
3. Acesse o endereço local fornecido no terminal pelo seu navegador.

---
