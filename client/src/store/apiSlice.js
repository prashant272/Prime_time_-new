import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from '../api/axiosBaseQuery';
import api from '../api/axios';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery(api),
  keepUnusedDataFor: 3600, // Keep cached data for 1 hour when component unmounts
  tagTypes: ['Blog', 'Comment', 'Nomination', 'Contact', 'AwardCategory', 'AwardEvent', 'Gallery', 'NominationSettings'],
  endpoints: (builder) => ({
    // ---- BLOGS ----
    getBlogs: builder.query({
      query: (params) => ({
        url: '/blogs',
        method: 'GET',
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
            ...result.data.map(({ _id }) => ({ type: 'Blog', id: _id })),
            { type: 'Blog', id: 'LIST' },
          ]
          : [{ type: 'Blog', id: 'LIST' }],
    }),
    getBlogById: builder.query({
      query: (id) => ({
        url: `/blogs/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Blog', id }],
    }),
    createBlog: builder.mutation({
      query: (formData) => ({
        url: '/blogs',
        method: 'POST',
        body: formData, // fetch will automatically set multipart/form-data boundary
      }),
      invalidatesTags: [{ type: 'Blog', id: 'LIST' }],
    }),
    updateBlog: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/blogs/${id}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Blog', id },
        { type: 'Blog', id: 'LIST' }
      ],
    }),
    deleteBlog: builder.mutation({
      query: (id) => ({
        url: `/blogs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Blog', id: 'LIST' }],
    }),

    // ---- COMMENTS ----
    getRecentComments: builder.query({
      query: () => ({
        url: '/blogs/recent-comments',
        method: 'GET',
      }),
      providesTags: ['Comment'],
    }),
    getBlogComments: builder.query({
      query: (blogId) => ({
        url: `/blogs/${blogId}/comments`,
        method: 'GET',
      }),
      providesTags: (result, error, blogId) => [{ type: 'Comment', id: blogId }],
    }),
    addComment: builder.mutation({
      query: ({ blogId, data }) => ({
        url: `/blogs/${blogId}/comments`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { blogId }) => [
        { type: 'Comment', id: blogId },
        'Comment'
      ],
    }),

    // ---- NOMINATIONS ----
    getNominations: builder.query({
      query: (params) => ({
        url: '/nominations/all',
        method: 'GET',
        params,
      }),
      providesTags: ['Nomination'],
    }),
    submitNomination: builder.mutation({
      query: (formData) => ({
        url: '/nominations/submit',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Nomination'],
    }),
    updateNominationStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/nominations/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Nomination'],
    }),
    updateNominationPayment: builder.mutation({
      query: ({ id, paymentStatus }) => ({
        url: `/nominations/${id}`,
        method: 'PUT',
        body: { paymentStatus },
      }),
      invalidatesTags: ['Nomination'],
    }),
    updateNomination: builder.mutation({
      query: ({ id, data }) => ({
        url: `/nominations/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Nomination'],
    }),
    deleteNomination: builder.mutation({
      query: (id) => ({
        url: `/nominations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Nomination'],
    }),

    // ---- NOMINATION SETTINGS ----
    getNominationSettings: builder.query({
      query: () => ({
        url: '/nomination-settings',
        method: 'GET',
      }),
      providesTags: ['NominationSettings'],
    }),
    updateNominationSettings: builder.mutation({
      query: (data) => ({
        url: '/nomination-settings',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['NominationSettings'],
    }),

    // ---- CONTACT ----
    getContactSubmissions: builder.query({
      query: () => ({
        url: '/contact/all',
        method: 'GET',
      }),
      providesTags: ['Contact'],
    }),
    submitContactForm: builder.mutation({
      query: (data) => ({
        url: '/contact/submit',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Contact'],
    }),
    updateContactStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/contact/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Contact'],
    }),
    deleteContact: builder.mutation({
      query: (id) => ({
        url: `/contact/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Contact'],
    }),

    // ---- AWARDS (CATEGORIES & EVENTS) ----
    getAwardCategories: builder.query({
      query: () => ({ url: '/awards/categories', method: 'GET' }),
      providesTags: ['AwardCategory'],
    }),
    createAwardCategory: builder.mutation({
      query: (data) => ({ url: '/awards/categories', method: 'POST', body: data }),
      invalidatesTags: ['AwardCategory'],
    }),
    updateAwardCategory: builder.mutation({
      query: ({ id, data }) => ({ url: `/awards/categories/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['AwardCategory'],
    }),
    deleteAwardCategory: builder.mutation({
      query: (id) => ({ url: `/awards/categories/${id}`, method: 'DELETE' }),
      invalidatesTags: ['AwardCategory'],
    }),

    getAwardEvents: builder.query({
      query: (params) => ({ url: '/awards/events', method: 'GET', params }),
      providesTags: ['AwardEvent'],
    }),
    getAwardEventBySlug: builder.query({
      query: (slug) => ({ url: `/awards/events/slug/${slug}`, method: 'GET' }),
      providesTags: (result, error, slug) => [{ type: 'AwardEvent', id: slug }],
    }),
    createAwardEvent: builder.mutation({
      query: (formData) => ({ url: '/awards/events', method: 'POST', body: formData }),
      invalidatesTags: ['AwardEvent'],
    }),
    updateAwardEvent: builder.mutation({
      query: ({ id, formData }) => ({ url: `/awards/events/${id}`, method: 'PUT', body: formData }),
      invalidatesTags: ['AwardEvent'],
    }),
    deleteAwardEvent: builder.mutation({
      query: (id) => ({ url: `/awards/events/${id}`, method: 'DELETE' }),
      invalidatesTags: ['AwardEvent'],
    }),

    // ---- ADMIN ----
    login: builder.mutation({
      query: (data) => ({
        url: '/admin/login',
        method: 'POST',
        body: data,
      }),
    }),
    signup: builder.mutation({
      query: (data) => ({
        url: '/admin/signup',
        method: 'POST',
        body: data,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/admin/logout',
        method: 'POST',
      }),
    }),
    // ---- GALLERY ----
    getGallery: builder.query({
      query: () => ({
        url: '/gallery',
        method: 'GET',
      }),
      providesTags: ['Gallery'],
    }),
    updateGallery: builder.mutation({
      query: (data) => ({
        url: '/gallery',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Gallery'],
    }),
    uploadGalleryPhoto: builder.mutation({
      query: (formData) => ({
        url: '/gallery/upload',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Gallery'],
    }),
  }),
});

export const {
  useGetBlogsQuery,
  useGetBlogByIdQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
  useGetRecentCommentsQuery,
  useGetBlogCommentsQuery,
  useAddCommentMutation,
  useGetNominationsQuery,
  useSubmitNominationMutation,
  useUpdateNominationStatusMutation,
  useUpdateNominationPaymentMutation,
  useUpdateNominationMutation,
  useDeleteNominationMutation,
  useGetContactSubmissionsQuery,
  useSubmitContactFormMutation,
  useUpdateContactStatusMutation,
  useDeleteContactMutation,

  useGetNominationSettingsQuery,
  useUpdateNominationSettingsMutation,
  
  useGetAwardCategoriesQuery,
  useCreateAwardCategoryMutation,
  useUpdateAwardCategoryMutation,
  useDeleteAwardCategoryMutation,
  useGetAwardEventsQuery,
  useGetAwardEventBySlugQuery,
  useCreateAwardEventMutation,
  useUpdateAwardEventMutation,
  useDeleteAwardEventMutation,
  
  useLoginMutation,
  useSignupMutation,
  useLogoutMutation,

  useGetGalleryQuery,
  useUpdateGalleryMutation,
  useUploadGalleryPhotoMutation,
} = apiSlice;
