import { db } from '../firebase';
import {
    collection,
    doc,
    setDoc,
    getDocs,
    updateDoc,
    query,
    where,
    getDoc,
    arrayUnion
} from 'firebase/firestore';
import { createNotification } from './notificationService';

const ENROLLMENTS_COLLECTION = 'enrollments';

/* ================= CREATE ENROLLMENT ================= */

export const createEnrollment = async (
    studentId,
    courseId,
    mentorId,
    paymentProofUrl,
    studentName,
    courseName,
    coursePrice
) => {
    try {
        const enrollmentId = `${studentId}_${courseId}`;
        const enrollmentRef = doc(db, ENROLLMENTS_COLLECTION, enrollmentId);

        // Prevent overwrite
        const existing = await getDoc(enrollmentRef);
        if (existing.exists()) {
            throw new Error('Enrollment already exists');
        }

        const numericPrice = coursePrice
            ? parseFloat(coursePrice.toString().replace('$', ''))
            : 0;

        const enrollmentData = {
            id: enrollmentId,
            studentId,
            studentName,
            courseId,
            courseName,
            coursePrice: numericPrice,
            mentorId,
            paymentProofUrl,
            status: 'pending',
            progress: 0,
            completed: false,
            enrolledAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await setDoc(enrollmentRef, enrollmentData);

        // Safe user update (no failure if user doc missing)
        const userRef = doc(db, 'users', studentId);
        await setDoc(
            userRef,
            {
                enrolledCourses: arrayUnion({
                    courseId,
                    progress: 0,
                    enrolledAt: new Date().toISOString()
                })
            },
            { merge: true }
        );

        return enrollmentData;
    } catch (error) {
        console.error('Error creating enrollment:', error);
        throw error;
    }
};

/* ================= MENTOR QUERIES ================= */

export const getMentorPendingEnrollments = async mentorId => {
    try {
        const q = query(
            collection(db, ENROLLMENTS_COLLECTION),
            where('mentorId', '==', mentorId),
            where('status', '==', 'pending')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => d.data());
    } catch (error) {
        console.error('Error fetching mentor enrollments:', error);
        return [];
    }
};

export const getMentorApprovedEnrollments = async mentorId => {
    try {
        const q = query(
            collection(db, ENROLLMENTS_COLLECTION),
            where('mentorId', '==', mentorId),
            where('status', '==', 'approved')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => d.data());
    } catch (error) {
        console.error('Error fetching approved enrollments:', error);
        return [];
    }
};

/* ================= STUDENT ACCESS ================= */

export const getStudentEnrollment = async (studentId, courseId) => {
    try {
        const enrollmentId = `${studentId}_${courseId}`;
        const docSnap = await getDoc(
            doc(db, ENROLLMENTS_COLLECTION, enrollmentId)
        );
        return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
        console.error('Error fetching enrollment:', error);
        return null;
    }
};

/* ================= APPROVE / REJECT ================= */

export const approveEnrollment = async enrollmentId => {
    try {
        const docRef = doc(db, ENROLLMENTS_COLLECTION, enrollmentId);
        const snap = await getDoc(docRef);

        if (!snap.exists()) return false;

        await updateDoc(docRef, {
            status: 'approved',
            approvedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        const data = snap.data();
        await createNotification(
            data.studentId,
            'Enrollment Approved',
            `Your enrollment for ${data.courseName} has been approved.`,
            'success'
        );

        return true;
    } catch (error) {
        console.error('Error approving enrollment:', error);
        return false;
    }
};

export const rejectEnrollment = async (enrollmentId, reason) => {
    try {
        const docRef = doc(db, ENROLLMENTS_COLLECTION, enrollmentId);
        const snap = await getDoc(docRef);

        if (!snap.exists()) return false;

        await updateDoc(docRef, {
            status: 'rejected',
            rejectionReason: reason,
            rejectedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        const data = snap.data();
        await createNotification(
            data.studentId,
            'Enrollment Rejected',
            `Your enrollment for ${data.courseName} was rejected. Reason: ${reason}`,
            'error'
        );

        return true;
    } catch (error) {
        console.error('Error rejecting enrollment:', error);
        return false;
    }
};

/* ================= UPDATE PROGRESS ================= */

export const updateEnrollmentProgress = async (
    studentId,
    courseId,
    progress
) => {
    try {
        const enrollmentId = `${studentId}_${courseId}`;
        const docRef = doc(db, ENROLLMENTS_COLLECTION, enrollmentId);

        await updateDoc(docRef, {
            progress: Math.min(Math.max(progress, 0), 100),
            completed: progress >= 100,
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error updating progress:', error);
    }
};
