const express = require("express");

const {
  createData,
  getData,
  generateToken,
  createUserAPIController,
} = require("../controllers/ayenati.controller");
const { verifyToken } = require("../utils/verifyToken");
const ayenatiRoute = express.Router();

/**
 * @swagger
 * /api/ayenati-inbound/token:
 *   post:
 *     summary: Generate token
 *     description: Generate token by provinding username and password to use APIs.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username for authentication
 *               password:
 *                 type: string
 *                 description: The password for authentication
 *     responses:
 *       '200':
 *         description: Token generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: token in string
 *                 user:
 *                   type: string
 *                   description: username of user
 *                 generatedAt:
 *                   description: date and time of token generation
 *                 expiresIn:
 *                   type: string
 *                   description: token valid time
 *       '400':
 *         description: Bad request .
 *       '500':
 *         description: Internal server error. Something went wrong on the server side.
 */

ayenatiRoute.post("/token", generateToken);

/**
 * @swagger
 * /api/ayenati-inbound/hl7/message:
 *  post:
 *      summary: Post HL7 message order API
 *      description: This API is used to take orders in the form of HL7 message string.
 *      requestBody:
 *        required: true
 *        content:
 *          text/plain:
 *            schema:
 *              type: string
 *              example: |
 *                HL7 String
 *      responses:
 *          200:
 *              description: HL7 message is created and stored in the database.
 *              content:
 *                application/json:
 *                  schema:
 *                    type: object
 *                    properties:
 *                      success:
 *                        type: boolean
 *                        description: Indicates whether the operation was successful.
 *                      message:
 *                        type: string
 *                        description: A message indicating the result of the operation.
 *                  examples:
 *                    successfulResponse:
 *                      value:
 *                        success: true
 *                        message: "HL7 message successfully......"
 *                        data: "Created Data Json"
 *          400:
 *              description: Bad request. This can happen if the request body is missing or malformed.
 *          500:
 *              description: Internal server error. Something went wrong on the server side.
 */

ayenatiRoute.post("/hl7/message", verifyToken, createData);
/**
 * @swagger
 * /api/ayenati-inbound/ayenatiData:
 *   get:
 *     summary: Retrieve all Ayenati orders from the database
 *     description: Endpoint to fetch all Ayenati orders stored in the database.
 *     parameters:
 *       - in: header
 *         name: security
 *         schema:
 *           type: string
 *         required: false
 *         description: Bearer token for authentication.
 *     responses:
 *       '200':
 *         description: Successfully retrieved all Ayenati orders.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the request was successful.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Unique identifier of the order.
 *                       ayenatiData:
 *                         type: string
 *                         description: HL7 message data.
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: Date and time when the order was created.
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         description: Date and time when the order was last updated.
 *                       __v:
 *                         type: number
 *                         description: Version field.
 *       '400':
 *         description: Bad request.
 *       '500':
 *         description: Internal server error. Something went wrong on the server side.
 */

ayenatiRoute.get("/ayenatiData", verifyToken, getData);

ayenatiRoute.post("/createUserAPIHidden", createUserAPIController);

module.exports = ayenatiRoute;
