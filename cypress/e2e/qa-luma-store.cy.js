/// <reference types="cypress" />


describe('Validações na QA Luma Store', () => {

    context('Criação de usuário e checkout de compra', () => {
        beforeEach(() => {

        cy.visit('/')

        })

        it('Deve realizar cadastro de usuário', () => {

            cy.contains('a','Create an Account').click()
            cy.url().should('contain','/account/create/')

            cy.request('GET','https://randomuser.me/api/', {
                dataType: 'json',
            }).then(res => {

                const { name, email, login } = res.body.results[0]

                cy.preencheDados('firstname', name.first)
                cy.preencheDados('lastname', name.last)
                cy.preencheDados('email', email)
                cy.preencheSenha("input#password", login.password + "Test123!@#$%")
                cy.preencheSenha("input#password-confirmation", login.password + "Test123!@#$%")
            })

            cy.get("button[title='Create an Account']").click()
            cy.url().should('contain','/customer/account/')

            cy.validaAlerta("div[role='alert']", 'Thank you for registering with Main Website Store.')

            cy.log('Nova conta criada com sucesso!')
        })

        it('Deve finalizar compra do último produto sugerido na busca', () => {

            cy.intercept('GET','**/suggest/?q=shirt**').as('resultadoPesquisa')
            cy.intercept('GET','**/Magento_Ui/**').as('aguardaReq')
            cy.intercept('GET', '**customer/section/load/**').as('aguardaCarrinho')
            cy.intercept('POST','**/estimate-shipping-methods**').as('aguardaShipping')

            cy.wait('@aguardaReq').then(() => cy.get("input[id='search']").type('shirt'))

            cy.wait('@resultadoPesquisa').then(() => {
                cy.get('div#search_autocomplete')
                    .should('be.visible')
                    .find("li[role='option']").then((list) => cy.get("li[role='option']").eq(list.length - 1).click())   
            })

            cy.url().should('include','/catalogsearch/result/')

            cy.selecionaOpcao('div.product-item-info', 1)
            cy.selecionaOpcao('div.size div.swatch-option', 0)
            cy.selecionaOpcao('div.color div.swatch-option', 0)

            cy.adicionaNoCarrinho()

            cy.validaCarrinho()

            cy.get("button[title='Proceed to Checkout']").click()

            cy.url().should('include', 'checkout/#shipping')

            cy.request('GET','https://randomuser.me/api/', {
                dataType: 'json',
            }).then(res => {

                const { name, email, location, phone } = res.body.results[0]


                cy.get('div._with-tooltip input#customer-email').type(email)

                cy.get("input[name='street[0]'").type(location.street.name)
                cy.get("input[name='street[1]'").type(location.street.number)
                cy.get("input[name='street[2]'").type('Automação Cypress')

                cy.preencheDados('firstname', name.first)
                cy.preencheDados('lastname', name.last)
                cy.preencheDados('city', location.city)
                cy.preencheDados('postcode', location.postcode)
                cy.preencheDados('telephone', phone)

                cy.selecionaCombo('region_id','Colorado')
                cy.selecionaCombo('country_id','United States')
            })

            cy.wait('@aguardaShipping').then(() => {
                cy.get("table.table-checkout-shipping-method input[name='ko_unique_3']").click()
                cy.get('div#shipping-method-buttons-container button').click()
            })

            cy.url().should('include','/checkout/#payment')

            cy.get("button[title='Place Order']").click()

            cy.url().should('include','/checkout/onepage/success/')

            cy.validaAlerta('span.base', 'Thank you for your purchase!')

            cy.log('Checkout realizado com sucesso!')
        })
    })

    context('Validações gerais', () => {
        beforeEach(() => {

        cy.intercept('GET', '**customer/section/load/**').as('aguardaCarrinho')

        cy.visit('/')

        })

        it('Deve validar a Home Page', () => {

            cy.contains('span','Home Page').should('be.visible')

            cy.log('Estamos na página principal!')
        })

        it('Deve adicionar um produto aleatório masculino no carrinho', () => {

            cy.selecionaProdutoAleatorio('Tops')

            cy.selecionaOpcao('div.size div.swatch-option', 0)
            cy.selecionaOpcao('div.color div.swatch-option', 0)

            cy.adicionaNoCarrinho()

            cy.validaCarrinho()

            cy.log('Produto aleatório do catálogo masculino adicionado ao carrinho!')
        })

        it('Deve adicionar um comentário em um produto aleatório do catálogo de moda masculino no carrinho', () => {

            cy.intercept('GET', '**/review/product/**').as('aguardaReview')

            Cypress._.times(3, () => {

                cy.selecionaProdutoAleatorio('Bottoms')

                cy.selecionaOpcao('div.size div.swatch-option', 0)
                cy.selecionaOpcao('div.color div.swatch-option', 0)

                cy.adicionaNoCarrinho()

                cy.validaCarrinho()
            })

            cy.selecionaAleatorioCarrinho()

            cy.contains('a.switch','Reviews').click()

            cy.wait('@aguardaReview').then(() => {
                cy.get("label[for='Rating_5']").click({force: true})
                cy.preencheDados('nickname', 'Automação Cypress')
                cy.preencheDados('title', 'Automação Cypress')
                cy.get("textarea[name='detail']").type('Testando aqui!!')
                
                cy.contains("button[type='submit']", 'Submit Review').click()
            })

            cy.wait('@aguardaCarrinho').then(() => cy.validaAlerta("div[role='alert']", 'You submitted your review for moderation.'))

            cy.log('Comentário em um item aleatório do carrinho adicionado com sucesso!')
            
        })
    })
})
