document.addEventListener('DOMContentLoaded', () => {
    const categoryButtons = document.querySelectorAll('.category-btn');
    const faqSections = document.querySelectorAll('.faq-section');
    const searchInput = document.getElementById('faq-search');
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    // Category filtering
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active button
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const category = button.dataset.category;
            
            // Show/hide sections based on category
            faqSections.forEach(section => {
                if (category === section.dataset.category) {
                    section.style.display = 'block';
                } else {
                    section.style.display = 'none';
                }
            });
        });
    });
    
    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        
        // Show all sections when searching
        faqSections.forEach(section => {
            section.style.display = 'block';
        });
        
        // Reset category buttons
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        categoryButtons[0].classList.add('active');
        
        // Filter questions based on search term
        document.querySelectorAll('.faq-item').forEach(item => {
            const question = item.querySelector('.faq-question').textContent.toLowerCase();
            const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
            
            if (question.includes(searchTerm) || answer.includes(searchTerm)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });
    
    // Accordion functionality
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            const isActive = question.classList.contains('active');
            
            // Close all other answers
            faqQuestions.forEach(q => {
                if (q !== question) {
                    q.classList.remove('active');
                    q.nextElementSibling.classList.remove('active');
                    const otherAnswer = q.nextElementSibling;
                    otherAnswer.style.height = '0';
                }
            });
            
            // Toggle current answer
            question.classList.toggle('active');
            answer.classList.toggle('active');
            
            // Set the height for smooth animation
            if (!isActive) {
                const content = answer.querySelector('.faq-answer-content');
                answer.style.height = content.offsetHeight + 'px';
            } else {
                answer.style.height = '0';
            }
            
            // Scroll into view if opening and not already visible
            if (!isActive) {
                const rect = answer.getBoundingClientRect();
                const isVisible = (rect.top >= 0) && (rect.bottom <= window.innerHeight);
                
                if (!isVisible) {
                    answer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }
        });
    });
    
    // Handle window resize to update answer heights
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const activeAnswers = document.querySelectorAll('.faq-answer.active');
            activeAnswers.forEach(answer => {
                const content = answer.querySelector('.faq-answer-content');
                answer.style.height = content.offsetHeight + 'px';
            });
        }, 100);
    });
}); 