'use strict';

var expect = require('chai').expect; //do I need this?

var mongodb = require('mongodb');
var mongoose = require('mongoose');

const uri = process.env['MONGO_URI']

mongoose.set('useFindAndModify', false);


module.exports = function (app) {

  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })

  var issueSchema = new mongoose.Schema({
    issue_title: {type: String, required: true},
    issue_text: {type: String, required: true},
    created_by : {type: String, required: true},
    assigned_to : String,
    status_text : String,
    open: {type: Boolean, required: true},
    created_on: {type: Date, required: true},
    updated_on: {type: Date, required: true},
    project: String
  })

  var Issue = mongoose.model('Issue', issueSchema)

  app.route('/api/issues/:project')
  
    //done
    .get(function (req, res){
      var project = req.params.project;

      var filterObject = Object.assign(req.query)
      filterObject['project'] = project

      Issue.find(filterObject, (error, arrayOfResults) => {
        if(!error && arrayOfResults) {
          return res.json(arrayOfResults)
        }
      })
      
    })
    
    //done
    .post(function (req, res){
      var project = req.params.project;

      if(!req.body.issue_title || !req.body.issue_text || !req.body.created_by){
        return res.json({ error: 'required field(s) missing' })
      }

      var newIssue = new Issue({
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by : req.body.created_by,
        assigned_to : req.body.assigned_to || '',
        status_text : req.body.status_text || '',
        open: true,
        created_on: new Date().toUTCString(),
        updated_on: new Date().toUTCString(),
        project: project
      })
      
      newIssue.save((error, savedIssue) => {
        if(!error && savedIssue) {
          return res.json(savedIssue)
        }
      })

    })
    

    //done? not passing fcc
    .put(function (req, res){
      var project = req.params.project;

      //check if id is missing
      if (!req.body._id) {
        console.log({ error: 'missing _id' })
        return res.json({ error: 'missing _id' });
      }

      var updateObject = {}

      Object.keys(req.body).forEach(key => {
        if(req.body[key] != '') {
          updateObject[key] = req.body[key];
        }
      })

      
      
      if (Object.keys(updateObject).length == 1) {
        return res.json({ error: 'no update field(s) sent', '_id': req.body._id });
      }
      
      updateObject['updated_on'] = new Date().toUTCString()

      Issue.findByIdAndUpdate(
        req.body._id,
        updateObject,
        {new: true},
        (error, updatedIssue) => {
        if(!error && updatedIssue){
            return res.json( { result: 'successfully updated', '_id': req.body._id })
          }else if(!updatedIssue){
            return res.json({ error: 'could not update', '_id': req.body._id })
          }
        }
      )

    })
    

    //done
    .delete(function (req, res){
      var project = req.params.project;
      
      if(!req.body._id) {
        return res.json({ error: 'missing _id' })
      }

      Issue.findByIdAndRemove(
        req.body._id,
        (error, deletedIssue) => {
          if(!error && deletedIssue){
              return res.json( { result: 'successfully deleted', '_id': req.body._id })
            }else if(!deletedIssue){
              return res.json({ error: 'could not delete', '_id': req.body._id })
            }
          })

    });
    
};
