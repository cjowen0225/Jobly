# Additions to Jobly Starter Code

## Part One
* Description added to SqlForPartialUpdate method in /helpers/sql.js
* /helpers/sql.test.js created to test the method above

## Part Two
* The findAll method in /models/companies.js was updated to include the option to narrow the list using the search filters; name, minEmployees, maxEmployees.
* Tests added to /models/company.test.js for the above filters and for the min > max error.
* The /routes/companies.js get('/') route was updated to filter on the entered query.
* The /routes/companies.test.js for the get('/') route was updated to include tests on filtering.
* /schemas/companySearch.json was created.

## Part Three
###Companies
* In /middleware/auth.js the ensureAdmin function was created.
* Tests for ensureAdmin were added in /middleware/auth.test.js.
* In /routes/companies the routes for post("/"), patch("/:handle"), and delete("/:handle") were all updated to an authorization level of Admin rather than just logged in user.
* In routes/_testCommon.js, adminToken was created and exported for testing.
* In routes/companies.tests.js, tests were created to check if the routes would work with admin users and fail with non-admin users

### Users
* In /routes/users the routes for post("/") and get("/") were updated to an authorization level of Admin rather than just logged in user.
* In /middleware/auth.js the ensureAdminOrUser function was created.
* Tests for ensureAdminOrUser were added in /middleware/auth.test.js.
* In /routes/users the routes for get("/:username"), patch("/:username"), and delete("/:username") were all updated to an authorization level of AdminOrUser rather than just logged in user.
* In routes/_testCommon.js, u2Token was created and exported for testing.
* In routes/users.tests.js, tests were created to check if the routes would work with admin or correct users and fail with non-admin or incorrect users

## Part Four
###Jobs
* Created a Jobs Model, model/job.js that followed the pattern of the Companies Model. Copied Company and made changes to fit Job Schema.
* Created Tests for the Jobs Model in /models/job.test.js. Copied Company Tests and made changes to fit Job Schema.
* Schemas created for NewJob and UpdateJob
* Created a Jobs Model, routes/job.js that followed the pattern of the Companies Routes. Copied Company and made changes to fit Job Schema.
* Created Tests for the Jobs Routes in /routes/jobs.test.js. Copied Company Tests and made changes to fit Job Schema.
* Added Jobs in the routes/_testCommon.js file for Job Route Testing.

###Filters
* The findAll method in /models/jobs.js was updated to include the option to narrow the list using the search filters; title, minSalary, hasEquity.
* Tests added to /models/company.test.js for the above filters and for the min > max error.
* Schema created for JobSearch

###Show Jobs for Company
* Add a Selector for Jobs within the company "get" method in models/company.js.

## Part Five
* Added the apply method to the User model.
* Added /:username/jobs/:id to the Users routes, /routes/users.js
* Updated the get User method and route to include the jobs the user has applied for.
* Added "applications" to the test of get users method
* Added "applications" to the test of get users route
* Added testing for the /:username/jobs/:id users route

