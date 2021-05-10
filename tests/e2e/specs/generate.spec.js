describe('Generates a wallet', () => {
  it('It should click the generate button', () => {
    cy.visit('/#/login');

    cy.get('a.button.cursor-pointer')
      .contains('Create one')
      .click();
  });
});
