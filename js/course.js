/**
 * Flatpickr options
 */
flatpickr(".flatpickr", {
    "locale": "fi",
    defaultDate: "a",
    altInput: true,
    altFormat: "F j, Y"
});

/**
 * Sends new course information to backend.
 * @param  {Object} exercises Exercises as a JavaScript object
 */
function createCoursePost(exercises) {
    var course = {
        html_id: data.courseSelect,
        coursekey: data.coursekey,
        name: data.courseName,
        exercises: exercises,
        startdate: data.startDate,
        enddate: data.endDate
    };

    console.log(course);

    $.ajax({
        url: BACKEND_BASE_URL + 'courses/newcourse',
        type : 'POST',
        dataType : 'json',
        contentType: 'application/json',
        data : JSON.stringify(course),
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
        success : function(data) {
            console.log(data);
            var alert = '<div id="join_course_alert" class="alert alert-success" role="alert">' + data.message + '</div>';
            $('#validationMessage').html(alert).show();
        },
        error: function(data) {
            console.log(data);
            var alert = '<div id="join_course_alert" class="alert alert-danger" role="alert">' + JSON.parse(data.responseText).error + '</div>';
            $('#validationMessage').html(alert).show();
        }
    });
}

/**
 * Extracts exercises from raw HTML data
 * @param  {String} pageData page as HTML file
 */
function extractExercises(pageData) {
    var regex = /(?:id="chapterNumber" value="([0-9])")|(?:<div\s+class="tehtava"\s+id="([a-zA-Z0-9ÅåÄäÖö.;:_-]+)">)/g;
    var regex_array = regex.exec(pageData);

    var exercises = {};
    var chapterNumber = 0;
    var exerciseCounter = 1;

    while (regex_array != null) {
        if (regex_array[1] == null) {
            exercises[chapterNumber + "." + exerciseCounter] = regex_array[2];
            exerciseCounter++;
        } else if (regex_array[2] == null) {
            chapterNumber = regex_array[1];
            exerciseCounter = 1;
        }
        regex_array = regex.exec(pageData);
    }
    createCoursePost(exercises);
}

/**
 * Gets course exercises from print.html page
 * @param  {String} course_id course HTML id
 */
function getCourseExercises(course_id) {
    var course_url = FRONTEND_BASE_URL + "kurssit/" + course_id + "/print.html";

    $.ajax({
        url : course_url,
        success : function(result){
            extractExercises(result);
        },
        error: function() {
            console.log("Could not retrieve course page");
        }
    });

}

/**
 * Executes as soon as DOM has loaded
 */
$(document).ready(function() {
    $("#newCourseForm").on('submit', function (e) {
        var alert = '<div id="join_course_alert" class="alert alert-info" role="alert">Kurssia luodaan...</div>';
        $('#validationMessage').html(alert).show();
        data = $(this).serializeArray().reduce(function(obj, item) {
            obj[item.name] = item.value;
            return obj;
        }, {});
        getCourseExercises(data.courseSelect);
        e.preventDefault();
    });

    // Form validation
    $('input').on('input',function(){
        var b = true;
        if ($("#courseName").val().length == 0) { b = false };
        if ($("#coursekey").val().length == 0) { b = false };
        if ($("#startDate").val().length == 0) { b = false };
        if ($("#endDate").val().length == 0) { b = false };
        if (b) {
            $("#submitCourse").prop("disabled", false);
            $("#validationMessage").hide();
        } else {
            $("#submitCourse").prop("disabled", true);
            $("#validationMessage").show();
        }
    });

});