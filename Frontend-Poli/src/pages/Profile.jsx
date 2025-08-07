
import { CardProfile } from '../components/profile/CardProfile'

const Profile = () => {
    return (
        <>       
            <div>
                <h1 className='font-black text-4xl text-gray-500'>Perfil</h1>
                <hr className='x'/>
                <p className='mb-8'>Este módulo te permite gestionar el perfil del usuario</p>
            </div>

            <div className='flex justify-around gap-x-8 flex-wrap gap-y-8 md:flex-nowrap'>
                <div className='w-full md:w-1/2'>
                
                </div>
                <div className='w-full md:w-1/2'>
                    <CardProfile/>
                </div>
            </div>
        </>

    )
}

export default Profile