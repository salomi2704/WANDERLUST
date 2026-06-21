(function () {
  'use strict'
  var forms = document.querySelectorAll('.needs-validation')

  Array.prototype.slice.call(forms).forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var commentField = form.querySelector('#comment');
      if (commentField && commentField.value.trim() === '') {
        commentField.setCustomValidity('Please enter a comment.');
      } else if (commentField) {
        commentField.setCustomValidity('');
      }

      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add('was-validated');
    }, false)
  })
})()
