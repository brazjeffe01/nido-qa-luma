// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('preencheDados', (attr, dados) => cy.get(`input[name=${attr}]`).type(dados))

Cypress.Commands.add('preencheSenha', (elemento, dados) => cy.get(elemento).type(dados, {log: false}))

Cypress.Commands.add('validaAlerta', (elemento, msg) => cy.get(elemento).should('be.visible').and('contain', msg))

Cypress.Commands.add('selecionaOpcao', (elemento, indice) => cy.get(elemento).eq(indice).click())

Cypress.Commands.add('selecionaCombo', (attr, valor) => cy.get(`select[name=${attr}]`).select(valor))

Cypress.Commands.add('adicionaNoCarrinho', () => cy.get("button#product-addtocart-button").click({timeout: 5000}))

Cypress.Commands.add('validaCarrinho', () => {
    cy.get('h1.page-title span').then((product) => {
        cy.wait('@aguardaCarrinho').then(() => cy.get("div[role='alert']")
            .should('be.visible')
            .and('contain',`You added ${product.text()} to your shopping cart.`))
        cy.get('a.showcart').click()
        cy.get('div.block-minicart strong.product-item-name a').each((elemento) => {
            if (elemento.text() == product.text()) {
                expect(elemento.text()).to.equal(product.text())
            }
        })  
    })
})

Cypress.Commands.add('selecionaProdutoAleatorio', (tipo) => {
    cy.get('li.nav-3').click()
    cy.contains('li.item a', tipo).click()
    cy.get('img.product-image-photo').then((products) => {
        const randomProduct = Math.floor(Math.random() * (products.length - 1))
        cy.get('img.product-image-photo').eq(randomProduct).click()
    })
})

Cypress.Commands.add('selecionaAleatorioCarrinho', () => {
    cy.get('div.block-minicart').should('be.visible')
    cy.get('ol#mini-cart div.product-item-details').then((products) => {
        const randomProduct = Math.floor(Math.random() * (products.length - 1))
        cy.get('img.product-image-photo').eq(randomProduct).click()
    })
})