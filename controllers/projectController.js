const Project = require('../models/Project');
const Segment = require('../models/Segment');

/**
 * Obtener todos los proyectos con sus segmentos
 */
async function getProjects(req, res) {
  try {
    console.log('🎬 Obteniendo todos los proyectos con sus segmentos');
    
    // Obtener todos los proyectos
    const projects = await Project.findAll();
    
    console.log(`✅ Proyectos encontrados: ${projects.length}`);
    
    // Convertir a formato de respuesta e incluir segmentos
    const projectsData = [];
    for (const project of projects) {
      const projectDict = project.toResponseDict();
      
      // Obtener segmentos del proyecto
      console.log(`🔍 Obteniendo segmentos para proyecto: ${project._id}`);
      const segments = await Segment.findByProject(project._id.toString());
      const segmentsData = segments.map(segment => segment.toResponseDict());
      
      // Agregar segmentos al proyecto
      projectDict.segments = segmentsData;
      projectDict.segments_count = segmentsData.length;
      
      projectsData.push(projectDict);
      console.log(`✅ Proyecto ${project._id} con ${segmentsData.length} segmentos`);
    }
    
    const response = {
      success: true,
      message: 'Proyectos obtenidos exitosamente',
      data: {
        projects: projectsData,
        count: projectsData.length
      }
    };
    
    console.log('📤 Enviando respuesta exitosa:', response);
    res.json(response);
    
  } catch (error) {
    console.log('💥 Error al obtener proyectos:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al obtener proyectos'
    });
  }
}

/**
 * Obtener un proyecto por ID con sus segmentos
 */
async function getProject(req, res) {
  try {
    const { projectId } = req.params;
    console.log(`🎬 Obteniendo proyecto con ID: ${projectId}`);
    
    // Buscar proyecto
    const project = await Project.findById(projectId);
    
    if (!project) {
      console.log(`❌ Proyecto no encontrado: ${projectId}`);
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }
    
    console.log(`✅ Proyecto encontrado: ${projectId}`);
    
    // Obtener segmentos del proyecto
    console.log(`🔍 Obteniendo segmentos para proyecto: ${projectId}`);
    const segments = await Segment.findByProject(projectId);
    const segmentsData = segments.map(segment => segment.toResponseDict());
    
    // Preparar respuesta con proyecto y segmentos
    const projectData = project.toResponseDict();
    projectData.segments = segmentsData;
    projectData.segments_count = segmentsData.length;
    
    const response = {
      success: true,
      message: 'Proyecto obtenido exitosamente',
      data: {
        project: projectData
      }
    };
    
    console.log(`✅ Proyecto ${projectId} con ${segmentsData.length} segmentos`);
    console.log('📤 Enviando respuesta exitosa:', response);
    res.json(response);
    
  } catch (error) {
    console.log('💥 Error al obtener proyecto:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al obtener proyecto'
    });
  }
}

/**
 * Crear un nuevo proyecto
 */
async function createProject(req, res) {
  try {
    const { video, audio } = req.body;
    
    console.log('🎬 Creando nuevo proyecto');
    console.log('📋 Datos recibidos:', { video, audio });

    // Validar datos requeridos
    if (!video) {
      return res.status(400).json({
        success: false,
        message: 'La URL del video es requerida'
      });
    }

    // Crear nuevo proyecto
    const project = new Project({
      video: video,
      audio: audio
    });
    
    console.log('💾 Guardando proyecto en la base de datos...');
    await project.saveProject();
    console.log('✅ Proyecto guardado exitosamente:', {
      _id: project._id.toString(),
      video: project.video,
      audio: project.audio
    });

    // Respuesta exitosa
    const response = {
      success: true,
      message: 'Proyecto creado exitosamente',
      data: {
        project: project.toResponseDict()
      }
    };

    console.log('📤 Enviando respuesta exitosa:', response);
    res.status(201).json(response);

  } catch (error) {
    console.log('💥 Error al crear proyecto:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al crear proyecto'
    });
  }
}

/**
 * Actualizar un proyecto
 */
async function updateProject(req, res) {
  try {
    const { projectId } = req.params;
    const { video, audio } = req.body;
    
    console.log(`🎬 Actualizando proyecto con ID: ${projectId}`);
    console.log('📋 Datos recibidos:', { video, audio });

    // Validar datos requeridos
    if (!video) {
      return res.status(400).json({
        success: false,
        message: 'La URL del video es requerida'
      });
    }

    // Buscar proyecto
    const project = await Project.findById(projectId);
    
    if (!project) {
      console.log(`❌ Proyecto no encontrado: ${projectId}`);
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }

    // Actualizar proyecto
    project.video = video;
    project.audio = audio;
    
    console.log('💾 Guardando cambios en la base de datos...');
    await project.saveProject();
    console.log('✅ Proyecto actualizado exitosamente:', {
      _id: project._id.toString(),
      video: project.video,
      audio: project.audio
    });

    // Respuesta exitosa
    const response = {
      success: true,
      message: 'Proyecto actualizado exitosamente',
      data: {
        project: project.toResponseDict()
      }
    };

    console.log('📤 Enviando respuesta exitosa:', response);
    res.json(response);

  } catch (error) {
    console.log('💥 Error al actualizar proyecto:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar proyecto'
    });
  }
}

/**
 * Eliminar un proyecto
 */
async function deleteProject(req, res) {
  try {
    const { projectId } = req.params;
    console.log(`🎬 Eliminando proyecto con ID: ${projectId}`);

    // Buscar proyecto
    const project = await Project.findById(projectId);
    
    if (!project) {
      console.log(`❌ Proyecto no encontrado: ${projectId}`);
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }

    // Eliminar proyecto
    console.log('🗑️ Eliminando proyecto de la base de datos...');
    await project.deleteProject();
    console.log('✅ Proyecto eliminado exitosamente:', projectId);

    // Respuesta exitosa
    const response = {
      success: true,
      message: 'Proyecto eliminado exitosamente',
      data: {
        project_id: projectId
      }
    };

    console.log('📤 Enviando respuesta exitosa:', response);
    res.json(response);

  } catch (error) {
    console.log('💥 Error al eliminar proyecto:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar proyecto'
    });
  }
}

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject
}; 