## The steps for me to update the website

1. Use `npm run build` in command line to rebuild the app
2. commit and push everything to the main branch
3. commit the subtree to the "gh-pages" branch (`git subtree push --prefix dist origin gh-pages1`)
4. Wait for some minutes and refresh the website...
5. Consider the delete remote branch `git push origin --delete feature/login`
6. (you can delete local branch by `git branch -D local_branch_name`)