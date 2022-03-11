import express from 'express'
import searchController from '../../controller/maincontroller/searchController.js'

const searchRT = express()
searchRT.get('/searchzoom', searchController.searchZoom)
searchRT.get('/', searchController.search)



export default searchRT