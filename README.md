# The Analysator

The Analysator is a simple tool for querying databases and charting the results.

It is also a massive security hole. Seriously. Handle with care.

## Installation

Install using `npm` and `bower`:

    $ cd analysator
    $ npm install
    $ bower install

To run, use `npm start`:

    $ npm start

You can set the `PORT` environment variable to specify a port. The default is
`3000`.

Use a modern browser like Chrome or Firefox.

## Usage

Set up a Postgres database somewhere accessible, e.g. `localhost`. In the
web GUI, specify a connection string like:

    postgres://user:password@localhost:5432/dbname

and then enter a database query. Click `Run` to execute the query. Then use
`Configure chart...` to set up charting if desired.

Analyses can be saved using the `Save` and `Save as...` buttons. Note that
they are only saved *locally* (using HTML local storage), not shared with
other users.
