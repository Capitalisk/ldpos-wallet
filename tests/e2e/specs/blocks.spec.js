describe('Blocks page tests', () => {
  it('should be loading the blocks', () => {
    cy.visit('/#/blocks');
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
    cy.get('td')
      .first()
      .trigger('mouseover');
  });

  it('should sort', () => {
    cy.get('#sorting').click();
  });

  it('shows details page', () => {
    cy.get('td')
      .first()
      .click();

    cy.get('i.fa.fa-arrow-left').click();
  });

  it('should load progress going to the next page', () => {
    cy.wait(500);
    cy.scrollTo('bottom');
    cy.get('#current-page').contains('1');

    cy.get('#next-page').click();
    cy.get('#current-page').contains('2');
  });

  it('go back to the previous page', () => {
    cy.wait(500);
    cy.get('#current-page').contains('2');

    cy.get('#previous-page').click();
    cy.get('#current-page').contains('1');
  });

  it('should have 10 rows', () => {
    cy.get('#data-table')
      .find('tr')
      .should('have.length', 10);
  });
});
