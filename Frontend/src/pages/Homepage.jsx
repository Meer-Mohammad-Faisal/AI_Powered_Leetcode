import React from 'react'
import { useEffect, useState } from 'react'
import { NavLink } from 'react-router' // Keep NavLink
import { useDispatch, useSelector } from 'react-redux'
import axiosClient from '../utils/axiosClient'
import { logoutUser } from '../authSlice'

function Homepage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all'
  });

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/getAllProblem');
        setProblems(data);
      } catch(error) {
        console.error('Error fetching problems:', error);
      }
    };

    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/problemSolvedByUser');
        setSolvedProblems(data);
      } catch(error){
        console.error('Error fetching solved problems:', error);
      }
    };

    fetchProblems();
    if(user) fetchSolvedProblems();
  }, [user]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]);
  };

  const filteredProblems = problems.filter(problem => {
    const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
    const tagMatch = filters.tag === 'all' || problem.tags?.includes(filters.tag);
    const statusMatch = filters.status === 'all' || 
                       (filters.status === 'solved' && solvedProblems.some(sp => sp._id === problem._id));
    return difficultyMatch && tagMatch && statusMatch;        
  });

  return (
    <div className='min-h-screen bg-base-200'>
      <nav className='navbar bg-base-100 shadow-lg px-4'>
        <div className='flex-1'>
          <NavLink to="/" className="btn btn-ghost text-xl">FaisCode</NavLink>
        </div>
        <div className='flex-none gap-4'>
          <div className='dropdown dropdown-end'>
            <div tabIndex={0} className='btn btn-ghost btn-circle avatar'>
              <div className='w-10 rounded-full bg-primary flex items-center justify-center text-white'>
                {user?.firstName?.charAt(0) || 'U'}
              </div>
            </div>
            <ul tabIndex={0} className='mt-3 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52'>
              <li>
                <span className='text-sm p-2'>Hello, {user?.firstName || 'User'}</span>
              </li>
              <li><button onClick={handleLogout}>Logout</button></li>
            </ul>
          </div>
        </div>
      </nav>

      {/* main content */}
      <div className='container mx-auto p-4'>
        <div className='flex flex-wrap gap-4 mb-6'>
          <select 
            className='select select-bordered'
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="all">All Problems</option>
            <option value="solved">Solved Problems</option>
          </select>

          <select 
            className='select select-bordered'
            value={filters.difficulty}
            onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <select 
            className='select select-bordered'
            value={filters.tag}
            onChange={(e) => setFilters({...filters, tag: e.target.value})}
          >
            <option value="all">All Tags</option>
            <option value="array">Array</option>
            <option value="linked list">Linked List</option>
            <option value="graph">Graph</option>
            <option value="dp">DP</option>
            <option value="string">String</option>
            <option value="tree">Tree</option>
            <option value="binary search">Binary Search</option>
          </select>
        </div>

        {/* Problem count */}
        <div className='mb-4'>
          <p className='text-lg'>
            Showing {filteredProblems.length} of {problems.length} problems
          </p>
        </div>

        {/* problem list */}
        <div className='grid gap-4'>
          {filteredProblems.length === 0 ? (
            <div className='text-center p-8'>
              <p className='text-lg'>No problems found matching your filters.</p>
            </div>
          ) : (
            filteredProblems.map(problem => (
              <div key={problem._id} className='card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow'>
                <div className='card-body'>
                  <div className='flex items-center justify-between'>
                    <h2 className='card-title text-xl'>
                      {/* FIXED: Use NavLink for the problem title */}
                      <NavLink 
                        to={`/problem/${problem._id}`} 
                        className="hover:text-primary transition-colors"
                      >
                        {problem.title || 'Untitled Problem'}
                      </NavLink>
                    </h2>
                    {solvedProblems.some(sp => sp._id === problem._id) && (
                      <div className='badge badge-success gap-2'>
                        <svg xmlns="http://www.w3.org/2000/svg" className='h-4 w-4' viewBox='0 0 20 20' fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Solved
                      </div>
                    )}
                  </div>

                  <p className='text-gray-600 mt-2'>
                    {problem.description || 'No description available'}
                  </p>

                  <div className='flex gap-2 mt-4 flex-wrap'>
                    <div className={`badge ${getDifficultyBadgeColor(problem.difficulty)}`}>
                      {problem.difficulty || 'Unknown'}
                    </div>
                    {problem.tags && Array.isArray(problem.tags) ? (
                      problem.tags.map((tag, index) => (
                        <div key={index} className='badge badge-outline badge-info'>
                          {tag}
                        </div>
                      ))
                    ) : (
                      <div className='badge badge-outline badge-info'>
                        {problem.tags || 'General'}
                      </div>
                    )}
                  </div>

                  <div className='card-actions justify-end mt-4'>
                    {/* FIXED: Use NavLink for the Solve Problem button */}
                    <NavLink 
                      to={`/problem/${problem._id}`}
                      className='btn btn-primary btn-sm'
                    >
                      Solve Problem
                    </NavLink>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const getDifficultyBadgeColor = (difficulty) => {
  if (!difficulty) return 'badge-neutral';
  
  switch(difficulty.toLowerCase()) {
    case 'easy': return 'badge-success';
    case 'medium': return 'badge-warning';
    case 'hard': return 'badge-error';
    default: return 'badge-neutral';
  }
};

export default Homepage;