import React from 'react';
import qs from 'qs';
import { useSelector } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Pagination from '../../components/posts/Pagination';

const PagenationContainer = ({ location, match }) => {
  const { lastPage, posts, loading } = useSelector(({ posts, loading }) => ({
    lastPage: posts.lastPage,
    posts: posts.posts,
    loading: loading['posts/LIST_POSTS'],
  }));

  if (!posts || loading) return null;

  const { username } = match.params;

  const { tag, page = 1 } = qs.parse(location.search, {
    ignoreQueryPrefix: true,
  });

  return (
    <Pagination
      tag={tag}
      username={username}
      page={parseInt(page, 10)}
      lastPage={lastPage}
    />
  );
};

export default withRouter(PagenationContainer);
