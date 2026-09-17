# Site institucional — LCM Express

Site estático (HTML, CSS e JavaScript puros), sem build, sem framework e sem dependências
para instalar. Basta enviar os arquivos para a hospedagem e o site entra no ar.

---

## 1. Estrutura dos arquivos

```
.
├── index.html            → página principal (todo o conteúdo do site)
├── 404.html              → página de erro personalizada
├── .htaccess             → cache, compressão (GZIP) e segurança no Apache/Hostinger
├── robots.txt            → liberação para os buscadores
├── sitemap.xml           → mapa do site (atualize o domínio, se mudar)
└── assets
    ├── css/style.css     → todo o design: cores, tipografia, layout e animações
    ├── js/main.js        → animações de scroll, menu, contadores e formulário
    └── img
        ├── logo-lcm.png  → logotipo (fundo transparente)
        └── favicon.png   → ícone da aba do navegador
```

Não existem imagens de banco de imagens: o globo, os ícones e o mapa de rotas são
desenhados em SVG dentro do próprio HTML. Isso deixa o site leve, nítido em qualquer
tela e fácil de manter.

---

## 2. Como publicar na Hostinger

### Opção A — Gerenciador de Arquivos (mais simples)

1. Acesse o **hPanel** da Hostinger → **Arquivos** → **Gerenciador de Arquivos**.
2. Entre na pasta **`public_html`** do domínio.
3. Apague os arquivos do site antigo (se houver), inclusive o `index.html` padrão.
4. Envie **o conteúdo desta pasta** — e não a pasta em si. Dentro de `public_html`
   deve ficar assim:
   ```
   public_html/index.html
   public_html/404.html
   public_html/.htaccess
   public_html/robots.txt
   public_html/sitemap.xml
   public_html/assets/...
   ```
   > Dica: envie o arquivo `.zip` do site e use **Extrair** no próprio gerenciador.
   > Se o `.zip` criar uma subpasta, mova os arquivos para dentro de `public_html`.
5. Confira se o arquivo **`.htaccess`** foi enviado. Ele começa com ponto e o
   gerenciador pode escondê-lo: ative **"Mostrar arquivos ocultos"** nas configurações.
6. Abra o domínio no navegador. Se ainda aparecer a versão antiga, limpe o cache
   (`Ctrl + F5`) e, no hPanel, use **Desempenho → Cache → Limpar cache**.

### Opção B — FTP

1. No hPanel: **Arquivos → Contas de FTP** e copie host, usuário e senha.
2. Conecte pelo FileZilla e envie todo o conteúdo desta pasta para `public_html`.

### Depois de publicar

- **SSL/HTTPS:** ative o certificado gratuito em **Segurança → SSL**. Depois disso,
  abra o `.htaccess` e remova o `#` das duas linhas do bloco *HTTPS* para forçar o
  redirecionamento de `http://` para `https://`.
- **Domínio no sitemap:** se o endereço final for diferente de
  `https://www.lcmexpressvix.com.br/`, atualize o domínio em `sitemap.xml`,
  `robots.txt` e na tag `<link rel="canonical">` do `index.html`.

---

## 3. Como alterar o conteúdo

Tudo fica em **`index.html`**, em português e comentado por seção
(`<!-- ============ HERO ============ -->`, `SOBRE`, `SERVIÇOS`, e assim por diante).

| O que mudar | Onde |
| --- | --- |
| Textos, títulos, serviços, depoimentos, perguntas frequentes | `index.html`, na seção correspondente |
| Telefone, e-mail, endereço e horário | seção `CONTATO` e `FOOTER` do `index.html` |
| Número do WhatsApp | procure por `5527999610409` no `index.html` **e** em `assets/js/main.js` (constante `WHATSAPP_NUMBER`) |
| Números da seção "Sobre" (+100 clientes etc.) | atributo `data-count` de cada `.counter` |
| Logotipo e favicon | substitua os arquivos em `assets/img/` mantendo os nomes |

### Cores da marca

No começo de `assets/css/style.css`, no bloco `:root`. Trocando essas variáveis, o
site inteiro acompanha:

```css
--navy-900:#06202f;   /* fundo escuro (diferenciais e rodapé) */
--navy-700:#0e4260;   /* azul do logotipo, títulos e botões */
--blue-500:#0f86bd;   /* azul de destaque e gradientes */
--lime-500:#b6e24a;   /* verde do logotipo, usado nos detalhes */
```

---

## 4. O formulário de cotação

Hospedagem estática não envia e-mail sozinha, então o formulário funciona sem servidor:
ao clicar em **Enviar pedido de cotação**, o site valida os campos e abre uma conversa
no WhatsApp da empresa já com todos os dados preenchidos — o cliente só confirma o envio.
O e-mail aparece logo abaixo do botão como alternativa.

**Se um dia quiser receber por e-mail**, há dois caminhos:

1. **Serviço externo (sem programação):** crie um formulário no
   [Formspree](https://formspree.io) ou similar e, no `index.html`, troque
   `<form class="quote-form" id="quoteForm" novalidate data-reveal>` por
   `<form class="quote-form" action="https://formspree.io/f/SEU-CODIGO" method="POST">`
   (remova o `id="quoteForm"` para o site não abrir mais o WhatsApp).
2. **PHP na Hostinger:** crie um `enviar.php` com a função `mail()` e aponte o
   `action` do formulário para ele.

---

## 5. Acessibilidade e desempenho

- Navegação completa por teclado, com foco visível e link "Ir para o conteúdo".
- Todas as animações são desligadas automaticamente para quem usa
  "reduzir movimento" no sistema operacional.
- Sem JavaScript, o conteúdo continua legível (as animações simplesmente não rodam).
- Sem bibliotecas externas: apenas as fontes do Google Fonts (Manrope e
  Instrument Serif) são carregadas da internet.
- Layout testado de 360px (celular) a 1440px (desktop), sem rolagem horizontal.
