$(document).ready(function() {
    $('.grid').masonry({
        // options
        itemSelector: '.grid-item',
        columnWidth: 200,
        percentPosition: true, // need to test with percentage width with columnWidth above
        gutter: 10,
    });

    $('.submit-note').on('click', function() {
        let newNote = {}

        newNote.articleId = $(this).attr('id')
        newNote.body = $('input').attr('data-id', newNote.articleId).val()

        $.ajax({
            type: 'POST',
            url: `/articles/${newNote.articleId}`,
            data: newNote
        }).done(function(data) {
            console.log('posted complete', data)
        })
    })
})