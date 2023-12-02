import React, { useState, useEffect } from 'react';

const App = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const totalRows = filteredUsers.length;

  useEffect(() => {
    // Fetch users from API and set them to both users and filteredUsers
    const fetchUsers = async () => {
      const response = await fetch('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json');
      const data = await response.json();
      setUsers(data);
      setFilteredUsers(data);
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    // Update selectAllChecked based on selectedRows
    setSelectAllChecked(selectedRows.length === filteredUsers.length);
  }, [selectedRows, filteredUsers]);

  const handleSearch = () => {
    const filtered = users.filter((user) =>
      ['name', 'email', 'role'].some((key) =>
        user[key].toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleCheckboxChange = (userId) => {
    const updatedSelectedRows = [...selectedRows];
    const index = updatedSelectedRows.indexOf(userId);

    if (index === -1) {
      updatedSelectedRows.push(userId);
    } else {
      updatedSelectedRows.splice(index, 1);
    }

    setSelectedRows(updatedSelectedRows);
  };

  const handleEditChange = (e, userId, field) => {
    const updatedUsers = users.map((user) =>
      user.id === userId ? { ...user, [field]: e.target.value } : user
    );

    const updatedFilteredUsers = filteredUsers.map((user) =>
      user.id === userId ? { ...user, [field]: e.target.value } : user
    );

    setUsers(updatedUsers);
    setFilteredUsers(updatedFilteredUsers);
  };

  const handleSelectAllChange = () => {
  const currentPageRows = filteredUsers
    .slice((currentPage - 1) * pageSize, currentPage * pageSize)
    .map((user) => user.id);

  const allCurrentPageRowsSelected = currentPageRows.every((id) =>
    selectedRows.includes(id)
  );

  if (allCurrentPageRowsSelected) {
    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.filter((id) => !currentPageRows.includes(id))
    );
  } else {
    setSelectedRows((prevSelectedRows) => [
      ...prevSelectedRows,
      ...currentPageRows.filter((id) => !prevSelectedRows.includes(id)),
    ]);
  }

  setSelectAllChecked(!allCurrentPageRowsSelected);
};
  

  const handleEditRow = (userId) => {
    setFilteredUsers((prevFilteredUsers) =>
      prevFilteredUsers.map((user) =>
        user.id === userId ? { ...user, isEditing: true } : user
      )
    );
  };

  const handleSaveRow = (userId) => {
    setFilteredUsers((prevFilteredUsers) =>
      prevFilteredUsers.map((user) =>
        user.id === userId ? { ...user, isEditing: false } : user
      )
    );
    // Save changes to the actions
  };

  const handleDeleteRow = (userId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this user?');

    if (confirmDelete) {
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      setFilteredUsers((prevFilteredUsers) =>
        prevFilteredUsers.filter((user) => user.id !== userId)
      );

      setSelectedRows((prevSelectedRows) => prevSelectedRows.filter((id) => id !== userId));
    }
  };


  const handleDeleteSelected = () => {
    const confirmDelete = window.confirm('Are you sure you want to delete the selected users?');

    if (confirmDelete) {
      setUsers((prevUsers) => prevUsers.filter((user) => !selectedRows.includes(user.id)));
      setFilteredUsers((prevFilteredUsers) =>
        prevFilteredUsers.filter((user) => !selectedRows.includes(user.id))
      );

      setSelectedRows([]);
    }
  };


  return (
    <div className="admin-dashboard min-h-screen bg-gray-100 font-sans">
      <div className="container mx-auto p-4">
      <h1 className="text-4xl font-extrabold text-center rounded-md text-blue-500 py-4 bg-gray-900 text-white" >Admin Dashboard</h1>
      <div className="flex flex-col md:flex-row items-center justify-between p-2">
      <div className="search-bar w-full md:w-96 flex items-center bg-gray-800 rounded-md p-2">
        <input
          className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500"
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button className='search-icon bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md ml-2' onClick={handleSearch}>Search</button>
      </div>
      <button
          className="delete-selected bg-red-500 hover:bg-red-600 mt-2 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline-red"
          onClick={handleDeleteSelected}
        >
          Delete Selected
        </button>
      </div>

      <div className="min-w-full bg-white border border-gray-300 rounded-lg overflow-hidden overflow-x-auto lg:overflow-y-scroll overflow-y-scroll lg:h-[60vh] h-[55vh]">
      <table className="min-w-full bg-white border border-gray-300 rounded-lg table-fixed">
        {/* Table header */}
        <thead className="bg-gray-800 text-white lg:sticky lg:top-0 sticky top-0">
          <tr>
            <th className="lg:pl-0 lg:pt-2 lg:pb-2 lg:pr-10 p-2">
              <input
                className="form-checkbox h-5 w-5 text-blue-500"
                type="checkbox"
                checked={selectAllChecked}
                onChange={handleSelectAllChange}
              />
            </th>
            <th className="lg:pl-0 lg:pt-2 lg:pb-2 lg:pr-16 py-2 px-4">Name</th>
            <th className="lg:pl-0 lg:pt-2 lg:pb-2 lg:pr-16 py-2 px-4">Email</th>
            <th className="lg:pl-0 lg:pt-2 lg:pb-2 lg:pr-16 py-2 px-4">Role</th>
            <th className="lg:pl-0 lg:pt-2 lg:pb-2 lg:pr-16 py-2 px-4">Actions</th>
          </tr>
        </thead>
        {/* Table body */}
        <tbody>
          {filteredUsers
            .slice((currentPage - 1) * pageSize, currentPage * pageSize)
            .map((user) => (
              <React.Fragment key={user.id}>
              <tr
                className={`${
                  selectedRows.includes(user.id) ? 'bg-blue-300' : ''
                } hover:bg-gray-100 transition duration-300`}
              >
                <td className="lg:pl-10 p-2">
                  <input
                    className="form-checkbox h-5 w-5 text-blue-500"
                    type="checkbox"
                    checked={selectedRows.includes(user.id)}
                    onChange={() => handleCheckboxChange(user.id)}
                  />
                </td>
                <td className="lg:pl-14 lg:px-0 py-2 px-4">
                  {user.isEditing ? (
                    <input className='bg-gray-500 py-2 px-2 rounded-md outline-none text-white' type="text" value={user.name} onChange={(e) => handleEditChange(e, user.id, 'name')} />
                  ) : (
                    <span>{user.name}</span>
                  )}
                </td>
                <td className="lg:pl-14 lg:px-0 py-2 px-4">
                  {user.isEditing ? (
                    <input className='bg-gray-500 py-2 px-2 rounded-md outline-none text-white' type="text" value={user.email} onChange={(e) => handleEditChange(e, user.id, 'email')} />
                  ) : (
                    <span>{user.email}</span>
                  )}
                </td>
                <td className="lg:pl-14 lg:px-0 py-2 px-4">
                  {user.isEditing ? (
                    <input className='bg-gray-500 py-2 px-2 rounded-md outline-none text-white' type="text" value={user.role} onChange={(e) => handleEditChange(e, user.id, 'role')} />
                  ) : (
                    <span>{user.role}</span>
                  )}
                </td>
                <td className="lg:pl-14 lg:px-0 py-2 px-4">
                  {user.isEditing ? (
                    <>
                      <button className='save bg-green-500 hover:bg-green-600 text-white mr-2 py-2 px-5 rounded focus:outline-none focus:shadow-outline-green' onClick={() => handleSaveRow(user.id)}>Save</button>
                      <button className='delete bg-red-500 hover:bg-red-600 text-white mt-2 py-2 px-4 rounded focus:outline-none focus:shadow-outline-red' onClick={() => handleDeleteRow(user.id)}>Delete</button>
                    </>
                  ) : (
                    <>
                      <button className='edit bg-blue-500 hover:bg-blue-600 text-white mr-2 py-2 px-6 rounded focus:outline-none focus:shadow-outline-blue' onClick={() => handleEditRow(user.id)}>Edit</button>
                      <button className='delete bg-red-500 hover:bg-red-600 text-white mt-2 py-2 px-4  rounded focus:outline-none focus:shadow-outline-red' onClick={() => handleDeleteRow(user.id)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
              <tr className="border-t border-gray-300"></tr>
              </React.Fragment>
            ))}
        </tbody>
      </table>
      </div>

{/* Pagination */}
<div className="pagination flex items-center justify-center flex-wrap mt-4">
  <button
    className="first-page bg-black hover:bg-blue-600 text-white py-2 px-4 rounded-l focus:outline-none focus:shadow-outline-blue mb-2 md:mb-0"
    onClick={() => handlePageChange(1)}
  >
    &lt;&lt;
  </button>
  <button
    className="previous-page bg-gray-500 hover:bg-blue-600 text-white py-2 px-4 focus:outline-none focus:shadow-outline-blue mb-2 md:mb-0"
    onClick={() => handlePageChange(currentPage - 1)}
  >
    &lt;
  </button>
  {Array.from({ length: Math.ceil(filteredUsers.length / pageSize) }).map((_, index) => (
    <button
      key={index + 1}
      className={`page ${currentPage === index + 1 ? 'bg-black text-white' : 'bg-gray-200 text-black hover:text-blue-600'} py-2 px-4 focus:outline-none focus:shadow-outline-blue mb-2 md:mb-0`}
      onClick={() => handlePageChange(index + 1)}
    >
      {index + 1}
    </button>
  ))}
  <button
    className="next-page bg-gray-500 hover:bg-blue-600 text-white py-2 px-4 focus:outline-none focus:shadow-outline-blue mb-2 md:mb-0"
    onClick={() => handlePageChange(currentPage + 1)}
  >
    &gt;
  </button>
  <button
    className="last-page bg-black hover:bg-blue-600 text-white py-2 px-4 rounded-r focus:outline-none focus:shadow-outline-blue mb-2 md:mb-0"
    onClick={() => handlePageChange(Math.ceil(filteredUsers.length / pageSize))}
  >
    &gt;&gt;
  </button>
</div>




  {/* Display number of selected rows */}
  <div className="text-gray-600 mt-4">
    {selectedRows.length > 0 && (
      <p className="bg-gray-700 text-white p-2 rounded">
        {`Selected ${selectedRows.length} out of ${totalRows}`}
      </p>
    )}
  </div>
</div>
  </div>
  );
};

export default App;
