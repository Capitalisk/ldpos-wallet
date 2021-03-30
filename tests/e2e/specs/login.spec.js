// https://docs.cypress.io/api/introduction/api.html

const PASSPHRASE =
  'cat ten problem setup immense lens great profit viable second risk balcony';

describe('Wallet testing', () => {
  it('checks if wallet is disabled', () => {
    cy.visit('/');
    cy.get('div.sidebar')
      .contains('WALLET')
      .should('have.class', 'disabled');
  });

  it('Pastes the password and spreads it over the inputs', () => {
    cy.visit('/');
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

    cy.wait(1000);

    // TEST SIGNIN TYPING
    // cy.get('.navbar.flex.justify-end a.button')
    //   .contains('Sign in')
    //   .click();
    cy.get('input#passphrase-0').should(($input) => {
      const type = $input[0].type;
      expect(type).to.match(/password/);
    });
    cy.get('input#passphrase-0').type(PASSPHRASE);
    cy.get('div#show')
      .contains('Show')
      .click();
    cy.get('div#show')
      .contains('Hide')
      .click();
    cy.get('div#show')
      .contains('Show')
      .click();
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
    cy.get('a.button.cursor-pointer').contains('Sign In').click();
    cy.get('a.button.cursor-pointer').contains('Hang in there...');
  });
});
