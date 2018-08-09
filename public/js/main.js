$(function () {
  if ($('textarea#ta').length) {
    CKEDITOR.replace('ta');
  }

  $('a.confirmDeletion').on('click', () => {
    if (!confirm('Are you sure ?')) {
      return false;
    }
  });

  // set availability product button
  $("#avBtn").click(function () {
    if ($(this).text() == "OFF") {
      $("#hidenAvBtn").val("ON");
      $(this).text("ON");
    } else {
      $("#hidenAvBtn").val("OFF");
      $(this).text("OFF")
    }

    // $(this).text() == "OFF" ? $(this).text("ON") : $(this).text("OFF");

  });

  // set fancybox plugin
  if ($("{data-fancybox}").length) {
    $("{data-fancybox}").fancybox();
  }

});