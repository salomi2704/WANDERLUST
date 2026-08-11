// (()=>{
//     "use strict";

//   const forms = document.querySelectorAll(".needs-validation");

//   Array.from(forms).forEach((form) => {
//     form.addEventListener("submit", (event) => {
//       const commentField = form.querySelector("#comment");
//       if (commentField.value.trim() === "") {
//         commentField.setCustomValidity("Please enter a comment.");
//       } else {
//         commentField.setCustomValidity("");
//       }

//       if (!form.checkValidity()) {
//         event.preventDefault();
//         event.stopPropagation();
//       }
//       form.classList.add("was-validated");
//     });
//   });
// });
// });
