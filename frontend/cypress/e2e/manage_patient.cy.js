// cypress/integration/login_spec.js
describe('Manage New Patient', function () {
    it('successfully adds new patient', function () {
        cy.visit('localhost:3000/login')

        cy.get('input[name=email]').type('testderma@email.com')
        cy.get('input[name=password]').type('dermapassword')
        cy.get('form').submit()

        // Should be redirected to the dashboard
        cy.url().should('include', '/dashboard')

        // click patients navbar
        cy.get('span').contains('Patients').click()
        cy.url().should('include', '/patients')
        cy.url().should('include', '/patients')

        // add patient
        cy.get('button').contains('Add Patient').click()
        cy.get('input[name=patient-search]').type('patient1@email.com')
        cy.get('ul').contains('patient1@email.com').click()
        cy.get('form').submit()


        // logout
        cy.get('button[id=profile_btn]').click()
        cy.get('a').contains('Logout').click()

    })

})


