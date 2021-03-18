// https://docs.cypress.io/api/introduction/api.html

const PASSPHRASE =
  'cat ten problem setup immense lens great profit viable second risk balcony';

describe('Wallet testing', () => {
  it('Visits the app root url', () => {
    cy.visit('/');
    cy.get('.sidebar').contains('DASHBOARD');
    cy.get('.sidebar').contains('WALLET');
    cy.get('.sidebar').contains('VOTING');
    cy.get('.sidebar').contains('TRANSACTIONS');
    cy.get('.sidebar').contains('BLOCKS');
    cy.get('.sidebar').contains('ACCOUNTS');
    cy.get('.sidebar').contains('DELEGATES');
    cy.get('.sidebar').contains('SIGN MESSAGE');
    cy.get('.sidebar').contains('VERIFY MESSAGE');
  });

  it('checks if wallet is disabled', () => {
    cy.visit('/');
    cy.get('div.sidebar')
      .contains('WALLET')
      .should('have.class', 'disabled');
  });

  it('Pastes the password and spreads it over the inputs', () => {
    cy.visit('/#/login');
    cy.get('input#passphrase-0')
      .invoke('val', PASSPHRASE)
      .trigger('input');

    for (let i = 0; i < 12; i++) {
      cy.get(`input#passphrase-${i}`).should(
        'have.value',
        PASSPHRASE.split(' ')[i],
      );
    }
  });

  it('It clicks signin button and signs in correcly', () => {
    cy.visit('/');

    // TEST SIGNIN TYPING
    cy.get('a.button')
      .contains('Sign in')
      .click();
    cy.get('input#passphrase-0').should(($input) => {
      const type = $input[0].type;
      expect(type).to.match(/password/);
    });
    cy.get('input#passphrase-0').type(PASSPHRASE);
    cy.get('div#show').contains('Show').click();
    cy.get('div#show').contains('Hide').click();
    cy.get('div#show').contains('Show').click();
    cy.get('input#passphrase-0').should(($input) => {
      const type = $input[0].type;
      console.log($input);
      expect(type).to.match(/text/);
    });

    for (let i = 0; i < 12; i++) {
      cy.get(`input#passphrase-${i}`).should(
        'have.value',
        PASSPHRASE.split(' ')[i],
      );
    }

    // LOGIN
    cy.get('a.button.cursor-pointer').click();
    cy.get('a.button.cursor-pointer').contains('Hang in there...');
    cy.wait(10000);

    // CHECK IF WALLET IS ENABLED
    cy.get('div.sidebar')
      .contains('WALLET')
      .should('not.have.class', 'disabled');

    // LOGOUT
    cy.location('pathname').should('eq', '/');
    cy.get('a.button')
      .contains('Sign out')
      .click();

    // TODO: Check if wallet address is enabled and disabled
  });
});
