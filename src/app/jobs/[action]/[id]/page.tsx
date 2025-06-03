"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import useCustomQuery from '@/hooks/useCustomQuery';
import PageSpinner from '@/components/common/atoms/ui/PageSpinner';
import { JobTitleType } from '@/types/JobTitle.type';

const JobTitleActionPage = () => {
    const params = useParams();
    const router = useRouter();
    const action = params.action as string;
    const id = params.id as string;

    // Fetch job title data if we're in edit mode
    const { data: jobTitle, isLoading } = useCustomQuery<JobTitleType>({
        queryKey: ["jobTitle", id],
        url: `/job-titles/find/${id}`,
        enabled: action === 'edit' && !!id,
    });

    useEffect(() => {
        // Store the job title data in session storage if we're in edit mode
        if (action === 'edit' && jobTitle) {
            const storageKey = `job_title_${id}`;
            sessionStorage.setItem(storageKey, JSON.stringify(jobTitle));

            // Redirect to the add-title page with the storage key as a parameter
            router.push(`/jobs/add-title?pageData=${storageKey}`);
        } else if (action === 'add') {
            // If adding, redirect to the add page
            router.push('/jobs/add-title');
        }
    }, [action, id, jobTitle, router]);

    if (isLoading) {
        return <PageSpinner />;
    }

    // This component won't render anything as it immediately redirects
    return null;
};

export default JobTitleActionPage; 