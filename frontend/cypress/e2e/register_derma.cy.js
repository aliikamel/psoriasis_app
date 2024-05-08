// cypress/integration/login_spec.js
describe('The Register Page', function () {
    it('successfully registers account', function () {
        cy.visit('localhost:3000/register')  // Change URL to match your local dev environment
        
        cy.get('button').contains('Dermatologist').click()

        cy.get('input[name=first_name]').type('derma');
        cy.get('input[name=last_name]').type('test');
        cy.get('input[name=email]').type('testderma@email.com')
        cy.get('input[name=password]').type('dermapassword')
        cy.get('input[name=confirm-password]').type('dermapassword')
        cy.get('input[id=terms]').check()
        cy.get('input[name=license-number]').type('1234-5678-9012')
        cy.get('form').submit()

        // Should be redirected to the dashboard
        cy.url().should('include', '/dashboard')
    })
})
