import React, { Component } from 'react';

class App extends Component {
    state = {
        posts: []
    };

    async componentDidMount() {
        try {
            const res = await fetch('https://djangoapp.run.goorm.io/api/');
            const posts = await res.json();
			console.log(posts);
			if(typeof posts == Array){
				this.setState({
                	posts
            	});
			}else{
				this.setState({
					posts:[{"id":"0","title": "detail", "content":posts.detail}]
				})
			}
				
			

        } catch (e) {
            console.log(e);
        }
    }

    render() {
        return (
            <div>
                {this.state.posts.map(item => (
                    <div key={item.id}>
                        <h1>{item.title}</h1>
                        <span>{item.content}</span>
                    </div>
                ))}
            </div>
        );
    }
}

export default App;