'use strict'

var chai = require('chai')
var sinon = require('sinon')
var sinon_chai = require('sinon-chai')

chai.config.includeStack = true
chai.use(sinon_chai)

global.expect = chai.expect
global.sinon = sinon