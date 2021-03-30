describe('Generates a wallet', () => {
  it('It should click the generate button', () => {
    cy.visit('/');

    cy.get('a.button.cursor-pointer')
      .contains('Generate')
      .click();

    cy.wait(2000);

    cy.get('a.button.cursor-pointer')
      .contains('Login')
      .click();

    cy.get('a.button.cursor-pointer').contains('Hang in there...')
  });
});
