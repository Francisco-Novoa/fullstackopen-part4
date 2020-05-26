const dummy = () => 1

const totalLikes = (blogs) => {
    return blogs.reduce((accumulator, currentValue) => {
        return currentValue.likes + accumulator
    }, 0)
}

const favoriteBlog = (blogs) => {
    const mostliked = blogs.reduce((accumulator, currentValue) => {
        return accumulator < currentValue.likes ? currentValue.likes : accumulator
    }, 0)
    return blogs.find((elem) => elem.likes === mostliked)
}

const mostBlogs = (blogs) => {
    let arr = []
    //here we create an array of objects with the format {author,blogs}

    blogs.forEach((elem) => {
        const isthere = arr.find((blog) => blog.author === elem.author)
        if (isthere) {
            const index = arr.findIndex((elem) => isthere === elem)
            arr[index] = {
                "author": arr[index].author,
                "blogs": arr[index].blogs + 1
            }
        }
        else {
            arr.push({
                "author": elem.author,
                "blogs": 1
            })
        }
    })

    //now we return the bussiest writer

    return arr.reduce((accumulator, currentValue) => {
        return accumulator.blogs < currentValue.blogs ? currentValue : accumulator
    })
}

const mostLikes = (blogs) => {
    let arr = []
    //here we create an array of objects with the format {author,likes}

    blogs.forEach((elem) => {
        const isthere = arr.find((blog) => blog.author === elem.author)
        if (isthere) {
            const index = arr.findIndex((elem) => isthere === elem)
            arr[index] = {
                "author": arr[index].author,
                "likes": arr[index].likes + elem.likes
            }
        }
        else {
            arr.push({
                "author": elem.author,
                "likes": elem.likes
            })
        }
    })

    //now we return the most liked

    return arr.reduce((accumulator, currentValue) => {
        return accumulator.likes < currentValue.likes ? currentValue : accumulator
    })
}


module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}