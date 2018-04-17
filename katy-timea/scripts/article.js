'use strict';

function Article (rawDataObj) {
  this.author = rawDataObj.author;
  this.authorUrl = rawDataObj.authorUrl;
  this.title = rawDataObj.title;
  this.category = rawDataObj.category;
  this.body = rawDataObj.body;
  this.publishedOn = rawDataObj.publishedOn;
}

// REVIEW: Instead of a global `articles = []` array, let's attach this list of all articles directly to the constructor function. Note: it is NOT on the prototype. In JavaScript, functions are themselves objects, which means we can add properties/values to them at any time. In this case, the array relates to ALL of the Article objects, so it does not belong on the prototype, as that would only be relevant to a single instantiated Article.
Article.all = [];

// COMMENT: Why isn't this method written as an arrow function?
// We can't use an arrow function here because the function is using 'contextual this'. Arrow functions to not have their own 'this'.
Article.prototype.toHtml = function() {
  let template = Handlebars.compile($('#article-template').text());

  this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);

  // COMMENT: What is going on in the line below? What do the question mark and colon represent? How have we seen this same logic represented previously?
  // the line is checking to see if there is data in the 'publishedOn' field. If it's empty then it assigns the selector as draft to hide the post until published.
  this.publishStatus = this.publishedOn ? `published ${this.daysAgo} days ago` : '(draft)';
  this.body = marked(this.body);

  return template(this);
};

// REVIEW: There are some other functions that also relate to all articles across the board, rather than just single instances. Object-oriented programming would call these "class-level" functions, that are relevant to the entire "class" of objects that are Articles.

// REVIEW: This function will take the rawData, how ever it is provided, and use it to instantiate all the articles. This code is moved from elsewhere, and encapsulated in a simply-named function for clarity.

// COMMENT: Where is this function called? What does 'rawData' represent now? How is this different from previous labs?
// It's called in the fetchAll function right below this one. 'rawData' is the contents of the JSON file, replacing the articleData.js file from previous labs.
Article.loadAll = articleData => {
  articleData.sort((a,b) => (new Date(b.publishedOn)) - (new Date(a.publishedOn)))

  articleData.forEach(articleObject => Article.all.push(new Article(articleObject)))
}

// REVIEW: This function will retrieve the data from either a local or remote source, and process it, then hand off control to the View.
Article.fetchAll = () => {
  // REVIEW: What is this 'if' statement checking for? Where was the rawData set to local storage?

  // COMMENT: sequence of code...
  // First we check to see if the data is in local storge from a previous page load. If it's there we render the articles through local storage.
  // Second, if there's not local storage we go to the else statement where we load up the data from the JSON file and set it to storage for use the next time we load the page.
  if (localStorage.rawData) {

    Article.loadAll(JSON.parse(localStorage.rawData));

    articleView.initIndexPage();

  } else {

    $.getJSON('/data/hackerIpsum.json')
      .then(data => {
        Article.loadAll(data);

        localStorage.rawData = JSON.stringify(data);
        articleView.initIndexPage();
      })
      .catch(err => console.error('You are amazing', err))
  }
}
