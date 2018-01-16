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

    $('.fullscreen').on('click', function() {
        console.log('clicked the expand button')

        let articleId = $(this).attr('id')

        console.log(articleId)

        $.ajax({
            type: 'GET',
            url: `/articles/${articleId}`
        }).done(function(article) {

            $('.modal-section').css('display', 'block')

            $('#modal-article-info').empty()
            $('#modal-notes').empty()

            let title = article.title !== 'undefined' ? $('<p>').text(article.title) : $('<p>').text('No title')
            let date = article.date !== 'undefined' ? $('<p>').text(article.date) : $('<p>').text('No date available')
            let excerpt = article.excerpt !== 'undefined' ? $('<p>').text(article.excerpt) : $('<p>').text('')
            let byline = article.byline !== 'undefined' ? $('<p>').text(article.byline) : $('<p>').text('By Unknown')
            let articleSection = $('<div>')
            let noteSection = $('<div>')

            articleSection.prepend(excerpt).prepend(date).prepend(byline).prepend(title)

            for (let i = 0; i < article.note.length; i++) {

                console.log(article.note)

                let note = article.note[i].body !== 'undefined' ? $('<p>').text(article.note[i].body) : $('<p>').text('Error retrieving this note.')
                noteSection.prepend(note)
            }

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