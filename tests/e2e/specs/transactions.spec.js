describe('Transactions page tests', () => {
  it('should be loading the transactions', () => {
    cy.visit('/#/transactions');
    cy.get('progress');
  });

  // it('should open the filter popup', () => {
  //   cy.get('.button')
  //     .contains('Filter')
  //     .click();
  //   cy.get('.popup');
  //   cy.get('.button')
  //     .contains('Filter')
  //     .click();
  // });

  it('should hover a td', () => {
    cy.get('td').first().trigger('mouseover');
  });

  it('should sort', () => {
    cy.get('#sorting').click();
    cy.get('progress');
  });

  it('should load when scrolling to bottom', () => {
    cy.wait(500);
    cy.scrollTo('bottom');
    cy.get('progress');
  });
});
