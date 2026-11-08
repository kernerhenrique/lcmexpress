# Site institucional da LCM Express

O site é estático, feito só com HTML, CSS e JavaScript: não tem etapa de build, framework nem nada para instalar. Basta enviar os arquivos para a hospedagem.
Nada é carregado de fora. As fontes, o logo e o globo ficam dentro do próprio site.

---

## 1. Arquivos

```
.
├── index.html               página principal (todo o conteúdo, comentado por seção)
├── 404.html                 página de erro
├── .htaccess                cache, compressão e segurança na Hostinger (Apache)
├── robots.txt, sitemap.xml  para os buscadores
├── assets/
│   ├── css/site.css         visual: cores, fontes, layout e animações
│   ├── js/site.js           menu, abas, etapas, contadores, cotação e o globo que gira
│   ├── js/globo-dados.js    pontos dos continentes do globo (gerado por ferramentas/gerar-globo.py)
│   ├── fonts/               Archivo e Source Sans 3 (licença OFL, arquivos .txt ao lado)
│   └── img/                 logo, favicon, globo e imagem de compartilhamento
└── ferramentas/             só para manutenção: NÃO enviar para a hospedagem
    ├── teste-site.js        teste automático (Playwright)
    ├── gerar-globo.py       gera os pontos do globo e a imagem parada (usada sem JavaScript)
    └── land-110m.json       mapa-múndi usado pelo globo (Natural Earth, domínio público)
```

## 2. Publicar na Hostinger

1. No **hPanel**, abra **Arquivos → Gerenciador de Arquivos → `public_html`**.
2. Apague os arquivos do site antigo.
3. Envie **o conteúdo** desta pasta, menos `ferramentas/`, `README.md`, `.vercelignore` e `.git`. Deve ficar assim: `public_html/index.html`, `public_html/assets/…`, `public_html/.htaccess` e assim por diante.
   - Dica: compacte num `.zip`, envie e use **Extrair**.
4. Confira se o `.htaccess` foi junto. Arquivos que começam com ponto ficam ocultos, então ative "Mostrar arquivos ocultos".
5. Abra o site e limpe o cache se aparecer a versão antiga (`Ctrl + F5` e, no hPanel, **Desempenho → Cache → Limpar cache**).
6. Com o SSL ativo (**Segurança → SSL**), tire o `#` das duas linhas do bloco HTTPS no `.htaccess`, para sempre abrir em `https://`.

**Prévia na Vercel (opcional):** conecte o repositório em vercel.com, em **Add New → Project**. A pasta `ferramentas/` fica fora pelo `.vercelignore`.

## 3. Trocar textos e dados

| O que | Onde |
| --- | --- |
| Textos de cada seção | `index.html`, procurando o comentário da seção (`INÍCIO`, `SERVIÇOS`, `COTAÇÃO`…) |
| WhatsApp | procure `5527999610409` no `index.html`, no `404.html` e em `assets/js/site.js` (`WHATSAPP`) |
| E-mail | procure `lcmvix@lcmexpressvix.com.br` no `index.html` e em `assets/js/site.js` (`EMAIL`) |
| Endereço e horário | seção `CONTATO` e o bloco `application/ld+json` no topo do `index.html` |
| Números (clientes, envios, países) | seção `NÚMEROS`, atributo `data-ate` e o texto ao lado |
| Cores | começo do `assets/css/site.css` (`--pet` é o azul do logo) |

**Depoimentos:** a seção foi retirada de propósito. Ela só deve voltar com depoimentos reais e com autorização dos clientes.

## 4. Centro autorizado FedEx

O site apresenta a LCM como **centro autorizado FedEx** em vários pontos: no selo do topo, na seção "Centro autorizado FedEx", no menu e no rodapé.
- **O selo é só em texto**, sem o logo da FedEx. A arte oficial só é fornecida pela própria FedEx. Se um dia a LCM receber o selo oficial, ele pode substituir o selo em texto (classe `selo-fedex` no `index.html`).
- **No rodapé** fica o aviso de marca: "FedEx é marca registrada da Federal Express Corporation".

**Destinos do globo:** a lista `DEST` em `assets/js/site.js` (nome, longitude e latitude).

## 5. Como funciona a cotação

O cliente preenche o tipo de envio, o destino, o peso e as medidas e os seus dados. São **obrigatórios**: país, **cidade** (o frete pode mudar conforme a cidade), nome e, para encomenda/amostra e carga, **o que vai ser enviado**. O site calcula o **peso cubado** (comprimento × largura × altura em cm ÷ 5.000, por volume) e mostra o **peso considerado**, que é o maior entre o real e o cubado.

- O divisor 5.000 foi conferido em 8/11/2026 nas páginas oficiais da DHL Express e no guia "Como embalar" da FedEx Brasil.
- O site **não mostra preço**.
- Ao enviar, abre o WhatsApp da LCM com a mensagem pronta. Também há um link para mandar os mesmos dados por e-mail.

## 6. Dúvidas frequentes: de onde vêm as informações

A resposta sobre a declaração de exportação (DRE até US$ 1.000; DU-E acima disso ou com licença, registrada pelo courier) segue o Manual de Remessas da Receita Federal, página "Declaração Aduaneira", atualizada em 01/08/2024. Revise se a regra mudar.

## 7. Testar

```
npx serve -l 8793 .
node ferramentas/teste-site.js
```
O teste confere:
- as abas, as etapas, os contadores e a cotação (peso cubado e mensagem do WhatsApp);
- as dúvidas;
- o celular (360 e 375 px);
- o movimento reduzido e o site sem JavaScript;
- que nada é carregado de fora.

Precisa do Playwright instalado (`npm i -D playwright`).
