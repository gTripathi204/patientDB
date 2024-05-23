// const schedule = require("node-schedule");
// const Patients = require("../models/patiend.model");
// const SmsLog = require("../models/smslog.model");
// const axios = require("axios");
// const SettingModel = require("../models/settings.model");

// //  scheduler is working

// // schedule.scheduleJob("*/90 * * * * *", async function () {
// //   const patientsWithDoctorNotification = await Patients.find()
// //     .populate({
// //       path: "doctor_id",
// //       match: { patientNotification: true }, // Filter doctors by patientNotification:true
// //     })
// //     .exec();

// // /////////this code is searching as expected
// // async function run() {
// //   const todayDate = new Date();
// //   // Extracting only the date part and converting to UTC format
// //   const todayDateString = todayDate.toISOString().split("T")[0];

// //   // Find documents where nextApointmentDate matches today's date
// //   const todayAppointments = await Patients.find({
// //     nextApointmentDate: {
// //       $gte: new Date(todayDateString + "T00:00:00Z"), // Start of today
// //       $lt: new Date(todayDateString + "T23:59:59Z"), // End of today
// //     },
// //   })
// //     .populate({
// //       path: "doctor_id",
// //     })
// //     .exec();

// //   // Filter the appointments based on patientNotification: true
// //   const todayAppointmentWithNotification = todayAppointments.filter(
// //     (appointment) => {
// //       return appointment.doctor_id.patientNotification === true;
// //     }
// //   );

// //   console.log("response", todayAppointmentWithNotification);
// // }
// // run();

// ///////////////////////////////////////////working code///////////////////

// async function sendSMS(element, token) {
//   const todayDate = new Date();
//   const todayDateString = todayDate.toISOString().split("T")[0];
//   console.log(
//     "Patient find ",
//     element?._id,
//     element?.doctor_id?._id,
//     todayDateString
//   );

//   const date = new Date();
//   const check = await SmsLog.countDocuments({
//     patientId: element?._id,
//     doctorId: element?.doctor_id?._id,
//     DateAndTime: {
//       $gte: new Date(todayDateString + "T00:00:00Z"),
//       $lt: new Date(todayDateString + "T23:59:59Z"),
//     },
//   });
//   // console.log("gaurav", check);
//   if (check !== 0) {
//     console.log("SMS already been send !!!!");
//   } else {
//     try {
//       const appointmentDateAndTime = new Date(element?.nextApointmentDate);
//       const appointmentTime = appointmentDateAndTime.toLocaleTimeString(
//         "en-US",
//         { hour: "2-digit", minute: "2-digit" }
//       );

//       const response = await axios.post(
//         "https://graph.facebook.com/v18.0/306388019215392/messages",
//         {
//           messaging_product: "whatsapp",
//           to: `91${element?.phone}`,
//           type: "template",
//           // template: {
//           //   name: "testtemplate",
//           //   language: {
//           //     code: "en",
//           //   },
//           // },
//           template: {
//             name: "patient_care_message",
//             language: {
//               code: "en",
//             },
//             components: [
//               {
//                 type: "header",
//                 parameters: [
//                   {
//                     type: "text",
//                     text: element?.name,
//                   },
//                 ],
//               },
//               {
//                 type: "body",
//                 parameters: [
//                   {
//                     type: "text",
//                     text: element?.doctor_id?.name,
//                   },
//                   {
//                     type: "text",
//                     text: appointmentTime,
//                   },
//                 ],
//               },
//             ],
//           },
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );
//       if (response) {
//         console.log("gaurva", response.data);
//         let data = {
//           patientId: element?._id,
//           doctorId: element?.doctor_id?._id,
//           DateAndTime: date,
//         };
//         SmsLog.create(data)
//           .then((res) => {
//             console.log("SMS send Successfully!!!!!", res.patientId);
//           })
//           .catch((error) => {
//             console.log("Error in logginf SMS", error);
//           });
//       } else {
//         alert("Error in sending message");
//       }
//     } catch (error) {
//       console.log("Error", error.response.data);
//     }
//   }
// }

// schedule.scheduleJob("*/60 * * * * *", async function () {
//   async function sendWhatsappMessage() {
//     const whatsappApiToken = await SettingModel.find();
//     if (whatsappApiToken) {
//       const whatsappToken = whatsappApiToken[0].whatsappCloudApi;
//       const todayDate = new Date();
//       const todayDateString = todayDate.toISOString().split("T")[0];

//       const todayAppointments = await Patients.find({
//         nextApointmentDate: {
//           $gte: new Date(todayDateString + "T00:00:00Z"),
//           $lt: new Date(todayDateString + "T23:59:59Z"),
//         },
//       })
//         .populate({
//           path: "doctor_id",
//           match: {
//             patientNotification: true,
//             isActive: true,
//             isDeleted: false,
//           },
//         })
//         .exec();

//       if (todayAppointments.length) {
//         const smsPromises = todayAppointments.map((element) => {
//           return sendSMS(element, whatsappToken);
//         });

//         await Promise.all(smsPromises);
//       } else {
//         console.log("There are no Patients to send SMS");
//       }
//     } else {
//       console.log("Error in Fetching Token");
//     }
//   }
//   sendWhatsappMessage();
// });

// // schedule.scheduleJob("*/60 * * * * *", async function () {
// //   async function run() {
// //     const todayDate = new Date();
// //     const todayDateString = todayDate.toISOString().split("T")[0];

// //     const todayAppointments = await Patients.find({
// //       nextApointmentDate: {
// //         $gte: new Date(todayDateString + "T00:00:00Z"),
// //         $lt: new Date(todayDateString + "T23:59:59Z"),
// //       },
// //     })
// //       .populate({
// //         path: "doctor_id",
// //         match: {
// //           patientNotification: true,
// //           isActive: true,
// //           isDeleted: false,
// //         },
// //       })
// //       .exec();

// //     if (todayAppointments.length) {
// //       todayAppointments.map((element) => {
// //         console.log(
// //           "Patient find ",
// //           element?._id,
// //           element?.doctor_id?._id,
// //           todayDateString
// //         );
// //         setTimeout(async () => {
// //           const date = new Date();
// //           const check = await SmsLog.countDocuments({
// //             patientId: element?._id,
// //             doctorId: element?.doctor_id?._id,
// //             DateAndTime: {
// //               $gte: new Date(todayDateString + "T00:00:00Z"),
// //               $lt: new Date(todayDateString + "T23:59:59Z"),
// //             },
// //           });
// //           // console.log("gaurav", check);
// //           if (check !== 0) {
// //             console.log("SMS already been send !!!!");
// //           } else {
// //             try {
// //               const appointmentDateAndTime = new Date(
// //                 element?.nextApointmentDate
// //               );
// //               const appointmentTime = appointmentDateAndTime.toLocaleTimeString(
// //                 "en-US",
// //                 { hour: "2-digit", minute: "2-digit" }
// //               );

// //               const response = await axios.post(
// //                 "https://graph.facebook.com/v18.0/306388019215392/messages",
// //                 {
// //                   messaging_product: "whatsapp",
// //                   to: `91${element?.phone}`,
// //                   type: "template",
// //                   // template: {
// //                   //   name: "testtemplate",
// //                   //   language: {
// //                   //     code: "en",
// //                   //   },
// //                   // },
// //                   template: {
// //                     name: "patient_care_message",
// //                     language: {
// //                       code: "en",
// //                     },
// //                     components: [
// //                       {
// //                         type: "header",
// //                         parameters: [
// //                           {
// //                             type: "text",
// //                             text: element?.name,
// //                           },
// //                         ],
// //                       },
// //                       {
// //                         type: "body",
// //                         parameters: [
// //                           {
// //                             type: "text",
// //                             text: element?.doctor_id?.name,
// //                           },
// //                           {
// //                             type: "text",
// //                             text: appointmentTime,
// //                           },
// //                         ],
// //                       },
// //                     ],
// //                   },
// //                 },
// //                 {
// //                   headers: {
// //                     Authorization:
// //                       "Bearer EAAEdfwuKcZAABO9T6cY7HCsWMUWhl8lZBQWLlUWMhyZB1PPMZCb09qAwZCrCRBfEMFEfBaZC3xvIYdrhODGCMLH0y4lunJeerOd5m0YmVjB5gjnJLqkhXZARVKUrCmB2FIRNm7dewgAcmV7ZCOZCbFg8FljrQg5bkJXx1h2utmqS5sin9fzkGYI6MYbJ8GlWnILlsDLuj2DWq9UHAR4ZBcO40ZD",
// //                     "Content-Type": "application/json",
// //                   },
// //                 }
// //               );
// //               if (response) {
// //                 console.log("gaurva", response.data);
// //                 let data = {
// //                   patientId: element?._id,
// //                   doctorId: element?.doctor_id?._id,
// //                   DateAndTime: date,
// //                 };
// //                 SmsLog.create(data)
// //                   .then((res) => {
// //                     console.log("SMS send Successfully!!!!!", res.patientId);
// //                   })
// //                   .catch((error) => {
// //                     console.log("Error in logginf SMS", error);
// //                   });
// //               } else {
// //                 alert("Error in sending message");
// //               }
// //             } catch (error) {
// //               console.log("Error", error.response.data);
// //             }
// //           }
// //         }, 2000);
// //       });
// //     } else {
// //       console.log("There are no Patients to send SMS");
// //     }
// //   }
// //   run();
// // });

// // schedule.scheduleJob("*/60 * * * * *", async function () {
// //   async function run() {
// //     const todayDate = new Date();
// //     const todayDateString = todayDate.toISOString().split("T")[0];

// //     const todayAppointments = await Patients.find({
// //       nextApointmentDate: {
// //         $gte: new Date(todayDateString + "T00:00:00Z"),
// //         $lt: new Date(todayDateString + "T23:59:59Z"),
// //       },
// //     })
// //       .populate({
// //         path: "doctor_id",
// //         match: {
// //           patientNotification: true,
// //           isActive: true,
// //           isDeleted: false,
// //         },
// //       })
// //       .exec();

// //     if (todayAppointments.length) {
// //       todayAppointments.map(async (element) => {
// //         console.log(
// //           "Patient find ",
// //           element?._id,
// //           element?.doctor_id?._id,
// //           todayDateString
// //         );

// //         const date = new Date();
// //         const check = await SmsLog.countDocuments({
// //           patientId: element?._id,
// //           doctorId: element?.doctor_id?._id,
// //           DateAndTime: {
// //             $gte: new Date(todayDateString + "T00:00:00Z"),
// //             $lt: new Date(todayDateString + "T23:59:59Z"),
// //           },
// //         });
// //         if (check.length) {
// //           console.log("SMS already been send !!!!");
// //         } else {
// //           try {
// //             const response = await axios.post(
// //               "https://graph.facebook.com/v18.0/306388019215392/messages",
// //               {
// //                 messaging_product: "whatsapp",
// //                 to: "917860678035",
// //                 type: "template",
// //                 template: {
// //                   name: "patient_care_message",
// //                   language: {
// //                     code: "en",
// //                   },
// //                   components: [
// //                     {
// //                       type: "header",
// //                       parameters: [
// //                         {
// //                           type: "text",
// //                           text: patientName,
// //                         },
// //                       ],
// //                     },
// //                     {
// //                       type: "body",
// //                       parameters: [
// //                         {
// //                           type: "text",
// //                           text: doctorName,
// //                         },
// //                         {
// //                           type: "text",
// //                           text: "3:58",
// //                         },
// //                       ],
// //                     },
// //                   ],
// //                 },
// //               },
// //               {
// //                 headers: {
// //                   Authorization:
// //                     "Bearer EAAEdfwuKcZAABO9T6cY7HCsWMUWhl8lZBQWLlUWMhyZB1PPMZCb09qAwZCrCRBfEMFEfBaZC3xvIYdrhODGCMLH0y4lunJeerOd5m0YmVjB5gjnJLqkhXZARVKUrCmB2FIRNm7dewgAcmV7ZCOZCbFg8FljrQg5bkJXx1h2utmqS5sin9fzkGYI6MYbJ8GlWnILlsDLuj2DWq9UHAR4ZBcO40ZD",
// //                   "Content-Type": "application/json",
// //                 },
// //               }
// //             );
// //             if (response) {
// //               alert("Whatsapp message is send successfully");
// //               console.log("gaurva", response);
// //             } else {
// //               alert("Error in sending message");
// //             }
// //           } catch (error) {
// //             console.log("Error", error);
// //           }
// //           let data = {
// //             patientId: element?._id,
// //             doctorId: element?.doctor_id?._id,
// //             DateAndTime: date,
// //           };
// //           SmsLog.create(data)
// //             .then((res) => {
// //               console.log("SMS send Successfully!!!!!", res.patientId);
// //             })
// //             .catch((error) => {
// //               console.log("Error in logginf SMS", error);
// //             });
// //         }
// //       });
// //     } else {
// //       console.log("There are no Patients to send SMS");
// //     }
// //   }
// //   run();
// // });

// ///////////////////////////////////////////////////////////////////////////

// ////////////////////////////////testing code //////////////////////

// // async function run() {
// //   const todayDate = new Date();
// //   const todayDateString = todayDate.toISOString().split("T")[0];

// //   const todayAppointments = await Patients.find({
// //     nextApointmentDate: {
// //       $gte: new Date(todayDateString + "T00:00:00Z"),
// //       $lt: new Date(todayDateString + "T23:59:59Z"),
// //     },
// //   })
// //     .populate({
// //       path: "doctor_id",
// //       match: {
// //         patientNotification: true,
// //         isActive: true,
// //         isDeleted: false,
// //       },
// //     })
// //     .exec();

// //   if (todayAppointments.length) {
// //     todayAppointments.map(async (element) => {
// //       console.log(
// //         "Patient find ",
// //         element?._id,
// //         element?.doctor_id?._id,
// //         todayDateString
// //       );

// //       setTimeout(async () => {
// //         const date = new Date();
// //         const check = await SmsLog.countDocuments({
// //           patientId: element?._id,
// //           doctorId: element?.doctor_id?._id,
// //           DateAndTime: {
// //             $gte: new Date(todayDateString + "T00:00:00Z"),
// //             $lt: new Date(todayDateString + "T23:59:59Z"),
// //           },
// //         });
// //         if (check) {
// //           console.log("SMS already been send !!!!");
// //         } else {
// //           let data = {
// //             patientId: element?._id,
// //             doctorId: element?.doctor_id?._id,
// //             DateAndTime: date,
// //           };
// //           SmsLog.create(data)
// //             .then((res) => {
// //               console.log("SMS send Successfully!!!!!", res.patientId);
// //             })
// //             .catch((error) => {
// //               console.log("Error in logginf SMS", error);
// //             });
// //         }
// //       }, 2000);
// //     });
// //   } else {
// //     console.log("There are no Patients to send SMS");
// //   }
// // }
// // run();
