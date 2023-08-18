var ghpages = require('gh-pages');

ghpages.publish(
    'public', // path to public directory
    {
        branch: 'gh-pages',
        repo: 'https://github.com/thefriedbee/personal-website.git', // Update to point to your repository  
        user: {
            name: 'Diyi Liu', // update to use your name
            email: 'diyi93@outlook.com' // Update to use your email
        }
    },
    () => {
        console.log('Deploy Complete!')
    }
)

