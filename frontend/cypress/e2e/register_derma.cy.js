// cypress/integration/login_spec.js
describe('Dermatologist Registration', function () {
    it('successfully registers account', function () {
        cy.visit('localhost:3000/register')  // Change URL to match your local dev environment
        
        cy.get('button').contains('Dermatologist').click()

        cy.get('input[name=first_name]').type('derma');
        cy.get('input[name=last_name]').type('test');
        cy.get('input[name=email]').type('test1dermatologist@email.com')
        cy.get('input[name=password]').type('test2dermatologist')
        cy.get('input[name=confirm-password]').type('test2dermatologist')
        cy.get('input[id=terms]').check()
        cy.get('input[name=license-number]').type('1000-0000')
        cy.get('form').submit()

        // Should be redirected to the dashboard
        cy.url().should('include', '/dashboard')
    })
})
