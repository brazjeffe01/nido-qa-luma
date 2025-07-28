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

                cy.get("input[name='firstname']").type(name.first)
                cy.get("input[name='lastname']").type(name.last)
                cy.get("input[name='email']").type(email)
                cy.get("input#password").type(login.password + "Test123!@#$%", {log: false})
                cy.get("input#password-confirmation").type(login.password + "Test123!@#$%", {log: false})

                cy.get("button[title='Create an Account']").click()
                cy.url().should('contain','/customer/account/')
                cy.contains("div[role='alert']",'Thank you for registering with Main Website Store.').should('be.visible')
                cy.log('Nova conta criada com sucesso!')
            })
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

            cy.get('div.product-item-info').eq(1).click()
            cy.get('div.size div.swatch-option').eq(0).click()
            cy.get('div.color div.swatch-option').eq(0).click()

            cy.get("button#product-addtocart-button").click({timeout: 5000})

            cy.get('h1.page-title span').then((product) => {
                cy.wait('@aguardaCarrinho').then(() => cy.get("div[role='alert']")
                    .should('be.visible')
                    .and('contain',`You added ${product.text()} to your shopping cart.`))
                cy.get('a.showcart').click()
                cy.get('div.block-minicart strong.product-item-name a')
                    .should('be.visible')
                    .and('contain', product.text())
            })

            cy.get("button[title='Proceed to Checkout']").click()

            cy.url().should('include', 'checkout/#shipping')

            cy.get('div._with-tooltip input#customer-email').type('teste')

            cy.request('GET','https://randomuser.me/api/', {
                dataType: 'json',
            }).then(res => {

                const { name, email, location, phone } = res.body.results[0]

                cy.get('div._with-tooltip input#customer-email').type(email)
                cy.get("input[name='firstname']").type(name.first)
                cy.get("input[name='lastname']").type(name.last)
                cy.get("input[name='street[0]']").type(location.street.name)
                cy.get("input[name='street[1]']").type(location.street.number)
                cy.get("input[name='street[2]']").type('Cypress Automation')
                cy.get("input[name='city']").type(location.city)
                cy.get("input[name='postcode']").type(location.postcode)
                cy.get("input[name='telephone']").type(phone)
                
                cy.get("select[name='region_id']").select('Colorado')
                cy.get("select[name='country_id']").select('United States')
            })

            cy.wait('@aguardaShipping').then(() => {
                cy.get("table.table-checkout-shipping-method input[name='ko_unique_3']").click()
                cy.get('div#shipping-method-buttons-container button').click()
            })

            cy.url().should('include','/checkout/#payment')
            cy.get("button[title='Place Order']").click()

            cy.url().should('include','/checkout/onepage/success/')
            cy.get('span.base').should('contain','Thank you for your purchase!')
            cy.log('Checkout realizado com sucesso!')
        })
    })

    context.only('Validações gerais', () => {
        beforeEach(() => {

        cy.visit('/')

        })

        it('Deve validar a Home Page', () => {

            cy.contains('span','Home Page').should('be.visible')
            cy.log('Estamos na página principal!')
        })

        it('Deve adicionar um produto aleatório masculino no carrinho', () => {

            cy.intercept('GET', '**customer/section/load/**').as('aguardaCarrinho')

            cy.get('li.nav-3').click()
            cy.contains('li.item a','Tops').click()
            cy.get('img.product-image-photo').then((products) => {
                const randomProduct = Math.floor(Math.random() * (products.length - 1))
                cy.get('img.product-image-photo').eq(randomProduct).click()
            })

            cy.get('div.size div.swatch-option').eq(0).click()
            cy.get('div.color div.swatch-option').eq(0).click()

            cy.get("button#product-addtocart-button").click({timeout: 5000})

            cy.get('h1.page-title span').then((product) => {
                cy.wait('@aguardaCarrinho').then(() => cy.get("div[role='alert']")
                    .should('be.visible')
                    .and('contain',`You added ${product.text()} to your shopping cart.`))
                cy.get('a.showcart').click()
                cy.get('div.block-minicart strong.product-item-name a')
                    .should('be.visible')
                    .and('contain', product.text())
            })

            cy.log('Produto aleatório do catálogo masculino adicionado ao carrinho!')
        })

        it.only('Deve adicionar um comentário em um produto aleatório do catálogo de moda masculino no carrinho', () => {

            cy.intercept('GET', '**customer/section/load/**').as('aguardaCarrinho')

            Cypress._.times(3, () => {
                cy.get('li.nav-3').click()
                cy.contains('li.item a','Tops').click()
                cy.get('img.product-image-photo').then((products) => {
                    const randomProduct = Math.floor(Math.random() * (products.length - 1))
                    cy.get('img.product-image-photo').eq(randomProduct).click()
                })

                cy.get('div.size div.swatch-option').eq(0).click()
                cy.get('div.color div.swatch-option').eq(0).click()

                cy.get("button#product-addtocart-button").click({timeout: 5000})

                cy.get('h1.page-title span').then((product) => {
                    cy.wait('@aguardaCarrinho').then(() => cy.get("div[role='alert']")
                        .should('be.visible')
                        .and('contain',`You added ${product.text()} to your shopping cart.`))
                })
            })

            cy.get('a.showcart').click()
            cy.get('div.block-minicart').should('be.visible')
            cy.get('ol#mini-cart div.product-item-details').then((products) => {
                    const randomProduct = Math.floor(Math.random() * (products.length - 1))
                    cy.get('img.product-image-photo').eq(randomProduct).click()
                })
            cy.contains('a.switch','Reviews').click()
            cy.get("label[for='Rating_5']").click({force: true})
            cy.get("input[name='nickname']").type('Cypress Testing')
            cy.get("input[name='title']").type('Cypress Testing')
            cy.get("textarea[name='detail']").type('Testando aqui!!')
            cy.contains("button[type='submit']", 'Submit Review').click()

            cy.wait('@aguardaCarrinho').then(() => cy.get("div[role='alert']")
                .should('be.visible')
                .and('contain',`You submitted your review for moderation.`))
            
        })
    })
})
