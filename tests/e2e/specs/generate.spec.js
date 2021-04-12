describe('Generates a wallet', () => {
  it('It should click the generate button', () => {
    cy.visit('/');

    cy.get('a.button.cursor-pointer')
      .contains('Create one')
      .click();

    cy.wait(7000);

    cy.get('a.button.cursor-pointer')
      .contains('Sign in')
      .click();

    cy.get('a.button.cursor-pointer').contains('Hang in there...')
  });
});
