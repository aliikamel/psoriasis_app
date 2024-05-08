// cypress/integration/login_spec.js
describe('The Login Page', function () {
    it('successfully logs in', function () {
        cy.visit('localhost:3000/login')  // Change URL to match your local dev environment

        cy.get('input[name=email]').type('testderma@email.com')
        cy.get('input[name=password]').type('dermapassword')
        cy.get('form').submit()

        

        // Should be redirected to the dashboard
        cy.url().should('include', '/dashboard')
        
        // click patients navbar 
        cy.get('span').contains('Patients').click()
        cy.url().should('include', '/patients')

        cy.get('a').contains('Open Patient').click()

        cy.url().should('include', '/patients')

        // logout
        cy.get('button[id=profile_btn]').click()
        cy.get('a').contains('Logout').click()

    })
})
