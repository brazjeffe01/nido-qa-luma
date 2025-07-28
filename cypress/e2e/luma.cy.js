/// <reference types="cypress" />


describe('Validações na QA Luma Store', () => {

    beforeEach(() => {
        cy.visit('/')
    })

    it('Validando a Home Page', () => {

        cy.contains('span','Home Page').should('be.visible')
        cy.log('Estamos na página principal!')
    })

    it.only('Finalizando compra do último produto sugerido na busca', () => {

        cy.intercept('GET','**/suggest/?q=shirt**').as('resultadoPesquisa')
        cy.intercept('GET','**/Magento_Ui/**').as('aguardaReq')
        cy.intercept('GET', '**customer/section/load/**').as('esperaCarrinho')

        cy.wait('@aguardaReq').then(() => cy.get("input[id='search']").type('shirt'))

        cy.wait('@resultadoPesquisa').then(() => {
            cy.get('div#search_autocomplete')
                .should('be.visible')
                .find("li[role='option']").then((list) => cy.get("li[role='option']").eq(list.length - 1).click())   
        })

        cy.url().should('include','/catalogsearch/result/')

        cy.get('div.product-item-info').eq(1).click()
        cy.get('div.size div.swatch-option').eq(0).click()
        cy.get('div.color div.swatch-option').eq(0).click()

        cy.get("button#product-addtocart-button").click({timeout: 5000})

        cy.get('h1.page-title span').then((product) => {
            cy.wait('@esperaCarrinho').then(() => cy.get("div[role='alert']")
                .should('be.visible'))
                .and('contain',`You added ${product.text()} to your shopping cart.`)
        })
        
    })

    it('Realizando cadastro de usuário', () => {

        cy.contains('a','Create an Account').click()
        cy.url().should('contain','/account/create/')

        cy.request('GET','https://randomuser.me/api/', {
            dataType: 'json',
        }).then(res => {

            const { name, email, login } = res.body.results[0]

            cy.get("input[name='firstname']").type(name.first)
            cy.get("input[name='lastname']").type(name.last)
            cy.get("input[name='email']").type(email)
            cy.get("input#password").type(login.password + "123!@#")
            cy.get("input#password-confirmation").type(login.password + "123!@#")

            cy.get("button[title='Create an Account']").click()
            cy.url().should('contain','/customer/account/')
            cy.contains("div[role='alert']",'Thank you for registering with Main Website Store.').should('be.visible')
            cy.log('Nova conta criada com sucesso!')

            })
    })
})
