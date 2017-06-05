'use strict';

const Datastore = require('@google-cloud/datastore');

// Instantiates a client
const datastore = Datastore();

/**
 * Gets a Datastore key from the kind/key pair in the request.
 *
 * @param {object} requestData Cloud Function request data.
 * @param {string} requestData.key Datastore key string.
 * @param {string} requestData.kind Datastore kind.
 * @returns {object} Datastore key object.
 */
function getKeyFromRequestData (requestData) {
  if (!requestData.key) {
    throw new Error('Key not provided. Make sure you have a "key" property in your request');
  }

  if (!requestData.kind) {
    throw new Error('Kind not provided. Make sure you have a "kind" property in your request');
  }

  return datastore.key([requestData.kind, requestData.key]);
}

/**
 * Creates and/or updates a record.
 * @param {object} req Cloud Function request context.
 * @param {object} req.body The request body.
 * @param {string} req.body.kind The Datastore kind of the data to save, e.g. "infinityOne".
 * @param {string} req.body.key Key at which to save the data, e.g. "ownerid@email.com".
 * @param {object} req.body.squareid Unique Id of the square, e.g. "squareid":"10010011".
 * @param {object} req.body.squaretype Type of the square, e.g. "squaretype":"financial".
 * @param {object} req.body.description Short description of the square, e.g. "squaretype":"financial".
 * @param {object} res Cloud Function response context.
 */
exports.setInfinityOneSquare = function setInfinityOneSquare (req, res) {
  // The value contains a JSON document representing the entity we want to save
  if (!req.body.squareid) {
    throw new Error('Square ID not provided. Make sure you have a "squareid" property in your request');
  }

  if (!req.body.squaretype) {
    throw new Error('Square type not provided. Make sure you have a "squaretype" property in your request');
  }

  const key = getKeyFromRequestData(req.body);
  const entity = {
    key: key,    
    data: [
      {
        name: 'squareid',
        value: req.body.squareid
      },
      {
        name: 'squaretype',
        value: req.body.squaretype
      },
      {
        name: 'description',
        value: req.body.description,
        excludeFromIndexes: true
      },
      {
        name: 'createdDate',
        value: new Date().toJSON()
      }
    ]
  };

  return datastore.save(entity)
    .then(() => res.status(200).send(`Entity ${key.path.join('/')} saved.`))
    .catch((err) => {
      console.error(err);
      res.status(500).send(err);
      return Promise.reject(err);
    });
};

/**
 * Retrieves a record.
 * @param {object} req Cloud Function request context.
 * @param {object} req.body The request body.
 * @param {string} req.body.kind The Datastore kind of the data to save, e.g. "infinityOne".
 * @param {string} req.body.key Key at which to save the data, e.g. "ownerid@email.com"..
 * @param {object} res Cloud Function response context.
 */
exports.getInfinityOneSquare = function getInfinityOneSquare (req, res) {
  const key = getKeyFromRequestData(req.body);

  return datastore.get(key)
    .then(([entity]) => {
      // The get operation will not fail for a non-existent entity, it just
      // returns null.
      if (!entity) {
        throw new Error(`No entity found for key ${key.path.join('/')}.`);
      }

      res.status(200).send(entity);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send(err);
      return Promise.reject(err);
    });
};

/**
 * Deletes a record.
 * @param {object} req Cloud Function request context.
 * @param {object} req.body The request body.
 * @param {string} req.body.kind The Datastore kind of the data to save, e.g. "infinityOne".
 * @param {string} req.body.key Key at which to save the data, e.g. "ownerid@email.com".
 * @param {object} res Cloud Function response context.
 */
exports.delInfinityOneSquare = function delInfinityOneSquare (req, res) {
  const key = getKeyFromRequestData(req.body);

  // Deletes the entity
  return datastore.delete(key)
    .then(() => res.status(200).send(`Entity ${key.path.join('/')} deleted.`))
    .catch((err) => {
      console.error(err);
      res.status(500).send(err);
      return Promise.reject(err);
    });
};