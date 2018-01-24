$(document).ready(function() {
    $('.grid').masonry({
        // options
        itemSelector: '.grid-item',
        columnWidth: 200,
        percentPosition: true, // need to test with percentage width with columnWidth above
        gutter: 10,
    });

    $('.fullscreen').on('click', function() {
        console.log('clicked the expand button')

        let articleId = $(this).attr('data-value')

        console.log(articleId)

        $.ajax({
            type: 'GET',
            url: `/articles/${articleId}`
        }).done(function(article) {

            $('.modal-section').css('display', 'block')

            $('#modal-article-info').empty()
            $('#modal-notes').empty()

            let title = article.title !== 'undefined' ? $('<p>').addClass('modal-title').text(article.title) : $('<p>').text('No title')
            let date = article.date !== 'undefined' ? $('<p>').addClass('modal-date').text(article.date) : $('<p>').text('No date available')
            let excerpt = article.excerpt !== 'undefined' ? $('<p>').addClass('modal-excerpt').text(article.excerpt) : $('<p>').text('')
            let byline = article.byline !== 'undefined' ? $('<p>').addClass('modal-byline').text(article.byline) : $('<p>').text('By Unknown')
            let articleSection = $('<div>')
            let noteSection = $('<div>')
            let noteSectionHeader = $('<p>').addClass('modal-note-header').text('Reader\'s Comments:')

            articleSection.prepend(excerpt).prepend(date).prepend(byline).prepend(title)

            for (let i = 0; i < article.note.length; i++) {

                let note = article.note[i].body !== 'undefined' ? $('<p>').addClass('modal-note').text(article.note[i].body) : $('<p>').text('Error retrieving this note.')
                let icon = $('<i>').addClass('modal-note-icon material-icons').text('speaker_notes')
                let flexDiv = $('<div>').addClass('modal-flex')

                flexDiv.prepend(note)
                flexDiv.prepend(icon)

                noteSection.prepend(flexDiv)
            }

            $('#modal-notes').prepend(noteSectionHeader)
            $('#modal-article-info').append(articleSection)
            $('#modal-notes').append(noteSection)
        })
    })

    $('.close-modal').on('click', closeModal)
    $(window).on('click', closeModal)
})

const closeModal = () => {
    $('.modal-section').css('display', 'none')
}

$(window).on('load', function() {
    $('.submit-note').on('click', function() {

        let newNote = {}

        newNote.articleId = $(this).attr('data-id')

        // console.log([newNote.articleId, $('input').attr('id'), $('input').attr('id', newNote.articleId).val(), $('input[id=' + newNote.articleId + ']').val()])

        newNote.body = $('input[id=' + newNote.articleId + ']').val()
        console.log(['newNote', newNote])

        $.ajax({
            type: 'POST',
            url: `/articles/${newNote.articleId}`,
            data: newNote
        }).done(function(data) {
            console.log('posted complete', data)
            // window.location.replace('/')
        })
    })
})
