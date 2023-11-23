const SessionHandler = require("./session");
const ProfileHandler = require("./profile");
const BenefitsHandler = require("./benefits");
const ContributionsHandler = require("./contributions");
const AllocationsHandler = require("./allocations");
const MemosHandler = require("./memos");
const ResearchHandler = require("./research");
const {
    environmentalScripts
} = require("../../config/config");
const ErrorHandler = require("./error").errorHandler;

const index = (app, db) => {

    "use strict";

    const sessionHandler = new SessionHandler(db);
    const profileHandler = new ProfileHandler(db);
    const benefitsHandler = new BenefitsHandler(db);
    const contributionsHandler = new ContributionsHandler(db);
    const allocationsHandler = new AllocationsHandler(db);
    const memosHandler = new MemosHandler(db);
    const researchHandler = new ResearchHandler(db);

    // Middleware to check if a user is logged in
    const isLoggedIn = sessionHandler.isLoggedInMiddleware;

    //Middleware to check if user has admin rights
    const isAdmin = sessionHandler.isAdminUserMiddleware;

    // The main page of the app
    app.get("/", sessionHandler.displayWelcomePage);

    // Login form
    app.get("/login", sessionHandler.displayLoginPage);
    app.post("/login", sessionHandler.handleLoginRequest);

    // Signup form
    app.get("/signup", sessionHandler.displaySignupPage);
    app.post("/signup", sessionHandler.handleSignup);

    // Logout page
    app.get("/logout", sessionHandler.displayLogoutPage);

    // The main page of the app
    app.get("/dashboard", isLoggedIn, sessionHandler.displayWelcomePage);

    // Profile page
    app.get("/profile", isLoggedIn, profileHandler.displayProfile);
    app.post("/profile", isLoggedIn, profileHandler.handleProfileUpdate);

    // Contributions Page
    app.get("/contributions", isLoggedIn, contributionsHandler.displayContributions);
    app.post("/contributions", isLoggedIn, contributionsHandler.handleContributionsUpdate);

    // Benefits Page
    app.get("/benefits", isLoggedIn, benefitsHandler.displayBenefits);
    app.post("/benefits", isLoggedIn, benefitsHandler.updateBenefits);
    /* Fix for A7 - checks user role to implement  Function Level Access Control
     app.get("/benefits", isLoggedIn, isAdmin, benefitsHandler.displayBenefits);
     app.post("/benefits", isLoggedIn, isAdmin, benefitsHandler.updateBenefits);
     */

    // Allocations Page
    app.get("/allocations/:userId", isLoggedIn, allocationsHandler.displayAllocations);

    // Memos Page
    app.get("/memos", isLoggedIn, memosHandler.displayMemos);
    app.post("/memos", isLoggedIn, memosHandler.addMemos);

    // Handle redirect for learning resources link
    app.get("/learn", isLoggedIn, (req, res) => {
        // Insecure way to handle redirects by taking redirect url from query string
// Define an allow-list of trusted URLs
const trustedUrls = [
    'http://www.example.com/',
    'https://www.anothertrusteddomain.com/',
    // Add other trusted URLs here
];

// Middleware to validate the redirect URL against the allow-list
const validateRedirectUrl = (req, res, next) => {
    const redirectUrl = req.query.url;
    if (trustedUrls.includes(redirectUrl)) {
        next(); // URL is trusted, proceed with the redirect
    } else {
        // URL is not trusted, handle according to your security policy
        // Option 1: Block the redirect and send an error message
        // return res.status(400).send('Invalid redirect URL.');

        // Option 2: Warn the user they are being redirected to an external site
        // This could involve rendering a warning page with a link for the user to click
        return res.render('externalRedirectWarning', { redirectUrl });
    }
};

// Use the middleware in the route that handles the redirect
app.get("/learn", isLoggedIn, validateRedirectUrl, (req, res) => {
    // The URL has been validated against the allow-list and is safe to redirect to
    return res.redirect(req.query.url);
});
    });

    // Handle redirect for learning resources link
    app.get("/tutorial", (req, res) => {
        return res.render("tutorial/a1", {
            environmentalScripts
        });
    });

    app.get("/tutorial/:page", (req, res) => {
        const {
            page
        } = req.params
// Define an allow list of permitted pages
const allowedPages = ['introduction', 'basics', 'advanced', 'summary'];

// Validate the 'page' parameter
const page = req.params.page; // or however you get the 'page' parameter from the user input

// Check if the requested page is in the allow list
if (allowedPages.includes(page)) {
    // If the page is allowed, render it
    return res.render(`tutorial/${page}`, {
        // ... additional context properties for rendering
    });
} else {
    // If the page is not allowed, render an error page or redirect to a safe default
    return res.status(404).send('Page not found'); // or res.render('error', { error: 'Page not found' });
}
            environmentalScripts
        });
    });

    // Research Page
    app.get("/research", isLoggedIn, researchHandler.displayResearch);

    // Error handling middleware
    app.use(ErrorHandler);
};

module.exports = index;